package net.paintstation.Paint.livepaint;

import jakarta.validation.Valid;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import net.paintstation.Paint.logger.LogInfoManager;
import net.paintstation.Paint.logger.LogWarningManager;
import net.paintstation.Paint.registry.PlayerRegistry;
import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.dto.PaintRequest;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.registry.User;
import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.websocket.WebSocketManager;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.Random;

/**
 * Handles the websocket requests and responses for live paint
 */
@Controller
public class PaintSocketController {

    private final PlayerRegistry registry;
    private final RoomRepository repository;
    private final PaintService service;
    private final WebSocketManager webSocketManager;
    private final LogWarningManager logWarningManager;

    public PaintSocketController(PlayerRegistry registry, RoomRepository repository, PaintService service, WebSocketManager webSocketManager, LogWarningManager logWarningManager) {
        this.registry = registry;
        this.repository = repository;
        this.service = service;
        this.webSocketManager = webSocketManager;
        this.logWarningManager = logWarningManager;
    }
    /**
     *
     * @param roomName The name of the room you are entering
     * @param request The paint object you are sending to other users to load on the canvas
     * @param accessor Used to extract session id from a specific web socket connection
     * @return returns the PaintResponse containing the paint object to be drawn on the other users canvases
     */
    @MessageMapping("/room/{roomName}/paint")
    @SendTo("/topic/room/{roomName}/paint")
    private PaintResponse broadcastStroke(@DestinationVariable String roomName, @Valid PaintRequest request, SimpMessageHeaderAccessor accessor){
        PaintObject paintObject = request.object();
        User user = registry.get(accessor.getSessionId());

        //store in repository and if over 50 objects request snapshot
        Optional<Room> optionalRoom = repository.findRoomByName(user.getRoomName());
        if(optionalRoom.isPresent()){
            Room room = optionalRoom.get();
            PaintResponse response = new PaintResponse(
                    paintObject.getType(),
                    user.getName(),
                    paintObject
            );
            boolean snapshotNeeded = room.addPaintObject(response);
            if(snapshotNeeded){
                requestSnapshot(room);
            }
            return response;
        }
        return null;
    }

    /**
     * Gets all player Ids picks a random one to request a snapshot from
     * Maybe in the future we should put some way of confirming that we actually received the snapshot IMPORTANT
     *
     * @param room The room which a snapshot is requested from
     */
    private void requestSnapshot(Room room){
        String[] ids = room.getAllPlayerIds();
        String id = ids[new Random().nextInt(ids.length)];
        //System.out.println("Snapshot Requested from: " + room.idToPlayer(id) );
        webSocketManager.requestSnapshot(id);
    }

    /**
     * Client sends request here upon loading into the room, and gets a response back to initialize their room
     *
     * @param accessor Used to extract session id from a specific web socket connection
     * @return a PaintSetupResponse to initialize the paint canvas on success
     */
    @SubscribeMapping("/room/{roomName}/init")
    public PaintSetupResponse setup(SimpMessageHeaderAccessor accessor){
        String id = accessor.getSessionId();
        User user = registry.get(id);
        Optional<Room> possibleRoom = repository.findRoomByName(user.getRoomName());
        if(possibleRoom.isPresent()){
            Room room = possibleRoom.get();
            room.registerPlayer(user.getName(), id);
        }
        else{
            logWarningManager.warning("ROOM NOT FOUND WHEN INIT SUBSCRIBE MAPPING");
        }
        PaintSetupRequest request = new PaintSetupRequest(user.getRoomName(), user.getName());
        return service.setup(request);
    }
    /**
     * Gets the client snapshot in response to requestSnapshot(room);
     *
     * @param imageBytes Where Png image is stored
     * @param accessor Used to extract session id from this specific web socket connection
     */
    @MessageMapping("/paint/snapshot")
    private void processSnapshot(byte[] imageBytes, SimpMessageHeaderAccessor accessor){
        User user = registry.get(accessor.getSessionId());
        //Files.write(Path.of("canvas.png"), imageBytes);
        repository.addSnapshot(user.getRoomName(), imageBytes);
        //maybe issue with threads
        repository.findRoomByName(user.getRoomName()).ifPresent(Room::setSnapshotFinished);
    }

    private static void debugRequest(PaintRequest request) {
        System.out.println("REQUEST");
        System.out.println(request);
        System.out.println("END REQUEST");
    }

    private static void debugResponse(PaintResponse response){
        System.out.println("RESPONSE");
        System.out.println(response);
        System.out.println("END RESPONSE");
    }

}
