package net.paintstation.Paint.Controller;

import jakarta.validation.Valid;
import net.paintstation.Paint.Models.*;
import net.paintstation.Paint.Service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/room")
public class RoomController {

    private final DashboardService roomService;
    private SimpMessagingTemplate template;

    public RoomController(DashboardService roomService, SimpMessagingTemplate template){
        this.roomService = roomService;
        this.template = template;
    }


    @PostMapping("/{roomName}/join")
    ResponseEntity<?> enterRoom(@PathVariable String roomName, @Valid @RequestBody JoinRoomRequest request){

        AccessRoomResult result = roomService.accessRoom(roomName, request);

        System.out.println("ROOMNAME : " + roomName);
        System.out.println("REQUEST : " + request);

        switch (result.status()) {
            case SUCCESS -> {
                Room room = result.room();
                String playerID = room.getPlayerID(request.username());
                RoomResponse roomResponse = new RoomResponse(room.getRoomID(), playerID, room.getOwner(), room.getPlayers(), room.getHistory());
                return ResponseEntity.status(HttpStatus.OK).body(roomResponse);
            }
            case NAME_TAKEN -> ResponseEntity.status(HttpStatus.CONFLICT).body("Name already taken");
            case ROOM_FULL -> ResponseEntity.status(HttpStatus.FORBIDDEN).body("Room is full");
            case INCORRECT_PASSWORD -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password");
            case ROOM_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        //highly unlikely to ever occur
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

        loadAllRoomsMessage allRooms = roomService.getAllRooms();
        return ResponseEntity.status(HttpStatus.OK).body(allRooms);
    }


}
