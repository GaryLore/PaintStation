package net.paintstation.Paint.Config;

import net.paintstation.Paint.Models.Room;
import net.paintstation.Paint.Registry.User;
import net.paintstation.Paint.RoomRepository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class RoomSafetyService {

    private final RoomRepository repository;

    RoomSafetyService(RoomRepository repository){
        this.repository = repository;
    }

    public boolean roomExist(String name){
        return repository.containsRoom(name);
    }

    public boolean userIDExistsInRoom(UUID userID, String roomName){
        return repository.userIdExistsinRoom(userID, roomName);
    }

    public String getUsername(UUID userID, String roomName){
        return repository.findRoomByName(roomName).map(room -> room.getPlayerName(userID)).orElse("");
    }

    public void cleanUp(User user){
        if(user == null) return;
        String roomName = user.getRoomName();
        UUID playerID = user.getUserID();
        Optional<Room> room = repository.findRoomByName(roomName);
        room.ifPresent(value -> {
            value.removePlayer(playerID);
        });
    }


}
