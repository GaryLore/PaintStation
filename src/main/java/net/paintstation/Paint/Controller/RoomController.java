package net.paintstation.Paint.Controller;

import jakarta.validation.Valid;
import net.paintstation.Paint.Models.*;
import net.paintstation.Paint.Service.DashboardService;
import net.paintstation.Paint.dto.internal.AccessRoomResult;
import net.paintstation.Paint.dto.websocket.RoomUpdate;
import net.paintstation.Paint.enums.RoomAction;
import net.paintstation.Paint.dto.request.CreateRoomRequest;
import net.paintstation.Paint.dto.request.JoinRoomRequest;
import net.paintstation.Paint.dto.response.RoomResponse;
import net.paintstation.Paint.dto.response.loadAllRoomsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;


@RestController
@RequestMapping("/api/room")
public class RoomController {

    private final DashboardService roomService;
    private final SimpMessagingTemplate template;

    public RoomController(DashboardService roomService, SimpMessagingTemplate template){
        this.roomService = roomService;
        this.template = template;
    }


    @PostMapping("/{roomName}/join")
    ResponseEntity<?> enterRoom(@PathVariable String roomName, @Valid @RequestBody JoinRoomRequest request){

        AccessRoomResult result = roomService.accessRoom(roomName, request);

        //.out.println("ROOMNAME : " + roomName);
        //System.out.println("REQUEST : " + request);

        System.out.println("IMPORTANT");
        System.out.println(result);
        System.out.println(result.status());

        return switch (result.status()) {
            case SUCCESS -> {
                Room room = result.room();
                UUID playerID = room.getPlayerID(request.username());
                RoomResponse roomResponse = new RoomResponse(room.getRoomID(), playerID, room.getOwner(), room.getPlayers(), room.getHistory());
                yield ResponseEntity.status(HttpStatus.OK).body(roomResponse);
            }
            case NAME_TAKEN -> ResponseEntity.status(HttpStatus.CONFLICT).body("Name already taken");
            case ROOM_FULL -> ResponseEntity.status(HttpStatus.FORBIDDEN).body("Room is full");
            case INCORRECT_PASSWORD -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password");
            case ROOM_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        };
    }


    @PostMapping("/create")
    ResponseEntity<?> startRoom(@Valid @RequestBody CreateRoomRequest request){

        Optional<Room> room = roomService.createRoom(request);

        if (room.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Room username already taken");
        }

        Room createdRoom = room.get();
        System.out.println("OWNER ID : " + createdRoom.getOwnerID());
        RoomResponse response = new RoomResponse(
                createdRoom.getRoomID(),
                createdRoom.getOwnerID(), //player in this case is owner
                createdRoom.getOwner(),
                createdRoom.getPlayers(),
                createdRoom.getHistory()
        );

        RoomUpdate update = new RoomUpdate(RoomAction.INSERT, createdRoom.getName() );
        System.out.println(update);
        template.convertAndSend("/topic/update", update);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }

    @GetMapping("/load")
    ResponseEntity<?> loadAllRooms(){

        loadAllRoomsResponse allRooms = roomService.getAllRooms();
        return ResponseEntity.status(HttpStatus.OK).body(allRooms);
    }


}
