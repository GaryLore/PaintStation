package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * The Service layer that handles the logic for the Paint Controller
 */
@Service
public class PaintService {

    private final RoomRepository repository;

    PaintService(RoomRepository repository){
        this.repository = repository;
    }

    /**
     * This does the logic side of getting the room and getting the required information to set up the users room
     *
     * @param request A request to setup the room
     * @return On success returns a PaintSetUpResponse on failure returns null
     */
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
