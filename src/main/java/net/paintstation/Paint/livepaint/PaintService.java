package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.RoomRepository.Room;
import net.paintstation.Paint.RoomRepository.RoomRepository;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class PaintService {

    private final RoomRepository repository;

    PaintService(RoomRepository repository){
        this.repository = repository;
    }

    PaintSetupResponse setup(PaintSetupRequest request){
        Optional<Room> room = repository.findRoomByName(request.roomName());

        if(room.isPresent()){
            Room accessedRoom = room.get();
            String[] players = accessedRoom.getAllPlayerNames();

            return new PaintSetupResponse(request.username(), request.roomName(), players);
        }
        return null;
    }
}
