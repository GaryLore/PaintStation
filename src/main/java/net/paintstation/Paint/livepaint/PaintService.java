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

    private Optional<Room> getRoomByID(UUID id){

        return repository.findRoomByUUID(id);
    }

    String getUsernameOfRoom(UUID userID, UUID roomID){

        return getRoomByID(roomID).map(room -> room.getPlayerName(userID)).orElse("");
    }
}
