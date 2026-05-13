package net.paintstation.Paint.Service;

import net.paintstation.Paint.Models.*;
import net.paintstation.Paint.RoomRepository.RoomRepository;
import net.paintstation.Paint.dto.internal.AccessRoomResult;
import net.paintstation.Paint.enums.AccessRoomStatus;
import net.paintstation.Paint.dto.request.CreateRoomRequest;
import net.paintstation.Paint.dto.request.JoinRoomRequest;
import net.paintstation.Paint.dto.response.loadAllRoomsResponse;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class DashboardService {

    private final RoomRepository repository;

    DashboardService(RoomRepository repository){
        this.repository = repository;
    }

    public Optional<Room> createRoom(CreateRoomRequest request) {

        Room room = new Room(
                request.roomName(),
                request.password(),
                request.ownerName()
        );

        System.out.println("[DashboardService.java] Room Name : " + request.roomName());
        System.out.println("[DashboardService.java] Password : " + request.password());
        System.out.println("[DashboardService.java] Owner Name : " + request.ownerName());

        boolean success = repository.InsertRoom(room);
        return success ? Optional.of(room) : Optional.empty();
    }

    public AccessRoomResult accessRoom(String roomName, JoinRoomRequest request){

        String username = request.username();
        String password = request.password();

        Optional<Room> room = repository.findRoom(roomName);

        if(room.isEmpty()){
            return AccessRoomResult.failure(AccessRoomStatus.ROOM_NOT_FOUND);
        }

        Room accessedRoom = room.get();
        boolean passwordCorrect = accessedRoom.isPasswordCorrect(password.trim());

        if (!passwordCorrect) {
            return AccessRoomResult.failure(AccessRoomStatus.INCORRECT_PASSWORD);
        }

        AccessRoomStatus status = insertPlayerIntoRoom(username, accessedRoom);
        return status == AccessRoomStatus.SUCCESS ? AccessRoomResult.success(accessedRoom) : AccessRoomResult.failure(status);
    }

    private AccessRoomStatus insertPlayerIntoRoom(String username, Room room){

        UUID userID = UUID.randomUUID();
        return room.addPlayer(userID, username);
    }

    public loadAllRoomsResponse getAllRooms(){

        return new loadAllRoomsResponse(repository.getAllRoomsInfo());
    }

}
