package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.Models.Room;
import net.paintstation.Paint.RoomRepository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class PaintService {

    private final RoomRepository repository;

    PaintService(RoomRepository repository){
        this.repository = repository;
    }

    String getUsernameOfRoom(UUID userID, String roomName){
        return repository.findRoomByName(roomName).map(room -> room.getPlayerName(userID)).orElse("");
    }
}
