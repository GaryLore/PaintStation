package net.paintstation.Paint.lobby.Service;

import net.paintstation.Paint.RoomRepository.Room;
import net.paintstation.Paint.RoomRepository.RoomRepository;
import net.paintstation.Paint.lobby.dto.internal.AccessRoomResult;
import net.paintstation.Paint.lobby.dto.request.CreateRoomRequest;
import net.paintstation.Paint.lobby.dto.request.JoinRoomRequest;
import net.paintstation.Paint.lobby.dto.response.loadAllRoomsResponse;
import net.paintstation.Paint.lobby.enums.AccessRoomStatus;
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

        System.out.println("[DashboardService.java] Room Name : \"" + request.roomName() + "\"");
        System.out.println("[DashboardService.java] Password : \"" + request.password() + "\"");
        System.out.println("[DashboardService.java] Owner Name : \"" + request.ownerName() + "\"");

        boolean success = repository.InsertRoom(room);
        return success ? Optional.of(room) : Optional.empty();
    }

    public AccessRoomResult accessRoom(String roomName, JoinRoomRequest request){

        String username = request.username();
        String password = request.password();

        Optional<Room> room = repository.findRoomByName(roomName);

        if(room.isEmpty()){
            return AccessRoomResult.failure(AccessRoomStatus.ROOM_NOT_FOUND);
        }

        Room accessedRoom = room.get();
        boolean passwordCorrect = accessedRoom.isPasswordCorrect(password.trim());

        if (!passwordCorrect) {
            return AccessRoomResult.failure(AccessRoomStatus.INCORRECT_PASSWORD);
        }

        if(accessedRoom.isFull()){
            return AccessRoomResult.failure(AccessRoomStatus.ROOM_FULL);
        }

        if(accessedRoom.isNameTaken(username)){
            return AccessRoomResult.failure(AccessRoomStatus.NAME_TAKEN);
        }

        return AccessRoomResult.success(accessedRoom);
    }

    public loadAllRoomsResponse getAllRooms(){

        return new loadAllRoomsResponse(repository.getAllRoomsInfo());
    }

}
