package net.paintstation.Paint.lobby.Controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import net.paintstation.Paint.RoomRepository.Room;
import net.paintstation.Paint.jwt.JwtUtil;
import net.paintstation.Paint.lobby.Service.DashboardService;
import net.paintstation.Paint.lobby.dto.internal.AccessRoomResult;
import net.paintstation.Paint.lobby.dto.request.CreateRoomRequest;
import net.paintstation.Paint.lobby.dto.request.JoinRoomRequest;
import net.paintstation.Paint.lobby.dto.response.RoomResponse;
import net.paintstation.Paint.lobby.dto.response.loadAllRoomsResponse;
import net.paintstation.Paint.lobby.dto.websocket.RoomUpdate;
import net.paintstation.Paint.lobby.enums.RoomAction;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/room")
public class RoomController {

    private final DashboardService roomService;
    private final SimpMessagingTemplate template;
    private final JwtUtil jwtUtil;

    public RoomController(DashboardService roomService, SimpMessagingTemplate template, JwtUtil jwtUtil){
        this.roomService = roomService;
        this.template = template;
        this.jwtUtil = jwtUtil;
    }

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
        template.convertAndSend("/topic/update", update);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomResponse);
    }

    @GetMapping("/load")
    ResponseEntity<?> loadAllRooms(){
        loadAllRoomsResponse allRooms = roomService.getAllRooms();
        return ResponseEntity.status(HttpStatus.OK).cacheControl(CacheControl.noStore()).body(allRooms);
    }
}
