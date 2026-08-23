package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
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
    public PaintSetupResponse setup(PaintSetupRequest request) {
        Optional<Room> room = repository.findRoomByName(request.roomName());

        if(room.isPresent()){
            Room accessedRoom = room.get();
            String username = request.username();
            String roomName = request.roomName();
            String[] players = accessedRoom.getAllPlayerNames();
            List<PaintResponse> paintResponses = accessedRoom.getHistory();
            try {
                byte[] pngSnapshot = getImage();
                System.out.println("PNG size: " + pngSnapshot.length + " bytes");
                System.out.println("Snapshot sent");
                return new PaintSetupResponse(username, roomName, players, pngSnapshot, paintResponses);
            } catch (IOException e) {
                System.out.println("SNAPSHOT RETURNED WENT WRONG");
                return null;
            }
        }
        return null;
    }

    private byte[] getImage() throws IOException {
        return Files.readAllBytes(Paths.get("canvas.png"));
    }
}
