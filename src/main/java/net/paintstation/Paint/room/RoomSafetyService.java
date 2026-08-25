package net.paintstation.Paint.room;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RoomSafetyService {

    private final RoomRepository repository;
    private final PasswordEncoder passwordEncoder;

    RoomSafetyService(RoomRepository repository, PasswordEncoder passwordEncoder){
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean roomExist(String name){
        return repository.containsRoom(name);
    }

    public boolean userExistsInRoom(String username, String roomName){
        return repository.userExistsInRoom(username, roomName);
    }

    public boolean isRoomFull(String roomName){
        Optional<Room> room = repository.findRoomByName(roomName);

        if(room.isPresent()){
            Room actualRoom = room.get();
            return actualRoom.isFull();
        }
        return true;
    }

}
