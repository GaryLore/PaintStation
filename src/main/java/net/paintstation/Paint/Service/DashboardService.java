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

    public Optional<Room> createRoom(CreateRoomRequest request) {

        Room room = new Room(
                request.roomName(),
                request.password(),
                request.ownerName()
        );

        System.out.println("Room Name : " + request.roomName());
        System.out.println("Password : " + request.password());
        System.out.println("Owner Name : " + request.ownerName());

        boolean success = repository.InsertRoom(room);
        return success ? Optional.of(room) : Optional.empty();
    }

    public AccessRoomResult accessRoom(String roomName, JoinRoomRequest request){

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

    private AccessRoomStatus insertPlayerIntoRoom(String username, Room room){

        String userID = UUID.randomUUID().toString();
        return room.addPlayer(userID, username);

    }

    public loadAllRoomsMessage getAllRooms(){

        return new loadAllRoomsMessage(repository.getAllRoomsInfo());
    }

}
