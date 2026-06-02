package net.paintstation.Paint.Config;

import net.paintstation.Paint.RoomRepository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RoomSafetyService {

    private final RoomRepository repository;

    RoomSafetyService(RoomRepository repository){
        this.repository = repository;
    }

    public boolean roomExist(String name){

    }

    public boolean userIDExistsInRoom(UUID userID, String roomName){

    }
}
