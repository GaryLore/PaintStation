package net.paintstation.Paint.lobby.Controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.jwt.JwtUtil;
import net.paintstation.Paint.lobby.Service.DashboardService;
import net.paintstation.Paint.lobby.dto.internal.AccessRoomResult;
import net.paintstation.Paint.lobby.dto.request.CreateRoomRequest;
import net.paintstation.Paint.lobby.dto.request.JoinRoomRequest;
import net.paintstation.Paint.lobby.dto.response.RoomResponse;
import net.paintstation.Paint.lobby.dto.response.loadAllRoomsResponse;
import net.paintstation.Paint.websocket.WebSocketManager;
import net.paintstation.Paint.websocket.dto.RoomUpdate;
import net.paintstation.Paint.lobby.enums.RoomAction;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Handles the lobby or other wise known as the homepage for creating and entering rooms for users
 */
@RestController
@RequestMapping("/api/room")
public class RoomController {

    private final DashboardService roomService;
    private final WebSocketManager webSocketManager;
    private final JwtUtil jwtUtil;

    public RoomController(DashboardService roomService, WebSocketManager webSocketManager, JwtUtil jwtUtil){
        this.roomService = roomService;
        this.webSocketManager = webSocketManager;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Handles a Post request to enter a room
     *
     * @param roomName The name of the room you want to join
     * @param request The Request to join a room containing the username of the player and the attempted password
     * @param response Used to access the response to insert the JWT as a Cookie
     * @return The result of the attempt to join a room, if successful returns a JWT(JSON Web Token) that allows you to subscribe to a web socket for this room
     */
    @PostMapping("/{roomName}/join")
    ResponseEntity<?> enterRoom(@PathVariable String roomName, @Valid @RequestBody JoinRoomRequest request, HttpServletResponse response){
        AccessRoomResult result = roomService.accessRoom(roomName, request);
        System.out.println("[RoomController.java] " + "USERNAME: \"" + request.username() + "\"" + " PASSWORD: " + "\"" + request.password() +"\" " + result.status() + " ON ROOM: \"" + roomName + "\"");
        return switch (result.status()) {
            case SUCCESS -> {
                RoomResponse roomResponse = new RoomResponse(roomName, request.username());

                //cookie
                String token = jwtUtil.generateToken(request.username(), roomName);
                ResponseCookie cookie = ResponseCookie.from("jwt", token)
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(15)
                        .build();

                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                yield ResponseEntity.status(HttpStatus.OK).body(roomResponse);
            }
            case NAME_TAKEN -> ResponseEntity.status(HttpStatus.CONFLICT).body("Name already taken");
            case ROOM_FULL -> ResponseEntity.status(HttpStatus.FORBIDDEN).body("Room is full");
            case INCORRECT_PASSWORD -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password");
            case ROOM_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        };
    }

    /**
     * Handles Post request creating a room
     *
     * @param request The Request to create a room containing the username of the player, the room name and the password
     * @param response Used to access the response to insert the JWT as a Cookie
     * @return The result of the attempt to create a room, if successful returns a JWT(Json Web Token) that allows you to subscribe to a web socket for this room
     */
    @PostMapping("/create")
    ResponseEntity<?> startRoom(@Valid @RequestBody CreateRoomRequest request, HttpServletResponse response){
        Optional<Room> room = roomService.createRoom(request);

        //means room creation failed
        if (room.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Room name already taken");
        }

        RoomResponse roomResponse = new RoomResponse(request.roomName(), request.ownerName());

        //cookie
        String token = jwtUtil.generateToken(request.ownerName(), request.roomName());
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(15)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        RoomUpdate update = new RoomUpdate(RoomAction.INSERT, request.roomName() );
        webSocketManager.broadcastRoomUpdate(update);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomResponse);
    }

    /**
     * Handles a Get Request for all the rooms available
     *
     * @return A Response entity containing all the available rooms also telling the browser to not cache the rooms so its always up to date
     */
    @GetMapping("/load")
    ResponseEntity<?> loadAllRooms(){
        loadAllRoomsResponse allRooms = roomService.getAllRooms();
        return ResponseEntity.status(HttpStatus.OK).cacheControl(CacheControl.noStore()).body(allRooms);
    }
}
