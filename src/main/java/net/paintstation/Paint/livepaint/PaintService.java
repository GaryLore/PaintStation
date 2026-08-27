package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.logger.LogInfoManager;
import net.paintstation.Paint.logger.LogWarningManager;
import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * The Service layer that handles the logic for the Paint Controller
 */
@Service
public class PaintService {

    private final RoomRepository repository;
    private final LogWarningManager logWarningManager;

    PaintService(RoomRepository repository, LogWarningManager logWarningManager){
        this.repository = repository;
        this.logWarningManager = logWarningManager;
    }

    /**
     * This does the logic side of getting the room and getting the required information to set up the users room
     *
     * @param request A request to setup the room
     * @return On success returns a PaintSetUpResponse on failure returns null
     */
    public PaintSetupResponse setup(PaintSetupRequest request) {
        Optional<Room> room = repository.findRoomByName(request.roomName());

        if(room.isPresent()){
            Room accessedRoom = room.get();
            String username = request.username();
            String roomName = request.roomName();
            String[] players = accessedRoom.getAllPlayerNames();
            byte[] pngSnapshot = getImage(roomName);
            List<PaintResponse> paintResponses = accessedRoom.getHistory();

            return new PaintSetupResponse(username, roomName, players, pngSnapshot, paintResponses);
        }
        logWarningManager.warning("ROOM IS NOT PRESENT IN SETUP METHOD");
        return null;
    }

    private byte[] getImage(String roomName) {
        return repository.getSnapshot(roomName);
    }
}
