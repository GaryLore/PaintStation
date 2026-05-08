package net.paintstation.Paint.Service;

import net.paintstation.Paint.Models.*;
import net.paintstation.Paint.Repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class DashboardService {

    private final DashboardRepository repository;

    DashboardService(DashboardRepository repository){
        this.repository = repository;
    }

    public Optional<Room> createRoom(createRoomRequest request) {

        Room room = new Room(
                request.roomName(),
                request.ownerName(),
                request.password()
        );
        boolean success = repository.InsertRoom(room);
        return success ? Optional.of(room) : Optional.empty();
    }

    AccessRoomResult accessRoom(String roomName, JoinRoomRequest request){

        String username = request.name();
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

    AccessRoomStatus insertPlayerIntoRoom(String username, Room room){

        String userID = UUID.randomUUID().toString();
        return room.addPlayer(userID, username);

    }

}
