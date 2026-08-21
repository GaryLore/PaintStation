package net.paintstation.Paint.livepaint;

import jakarta.validation.Valid;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import net.paintstation.Paint.registry.PlayerRegistry;
import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.dto.PaintRequest;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.registry.User;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.websocket.WebSocketManager;
import net.paintstation.Paint.websocket.dto.PlayerUpdate;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Principal;

/**
 * Handles the websocket requests and responses for live paint
 */
@Controller
public class PaintSocketController {

    private final PlayerRegistry registry;
    private final RoomRepository repository;
    private final PaintService service;
    private final WebSocketManager webSocketManager;
    private final SimpUserRegistry principalRegistry;

    public PaintSocketController(PlayerRegistry registry, RoomRepository repository, PaintService service, WebSocketManager webSocketManager, SimpUserRegistry principalRegistry) {
        this.registry = registry;
        this.repository = repository;
        this.service = service;
        this.webSocketManager = webSocketManager;
        this.principalRegistry = principalRegistry;
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


        PaintResponse response = new PaintResponse(
                paintObject.getType(),
                user.getName(),
                paintObject
        );
        return response;
    }

    /**
     * Client sends request here upon loading into the room, and gets a response back to initialize their room
     *
     * @param accessor Used to extract session id from a specific web socket connection
     * @return a PaintSetupResponse to initialize the paint canvas on success
     */
    @SubscribeMapping("/room/{roomName}/init")
    public PaintSetupResponse setup(SimpMessageHeaderAccessor accessor){
        User user = registry.get(accessor.getSessionId());
        PaintSetupRequest request = new PaintSetupRequest(user.getRoomName(), user.getName());
        PaintSetupResponse response = service.setup(request);
        return response;
    }

    @MessageMapping("/paint/snapshot")
    private void processSnapshot(byte[] imageBytes, SimpMessageHeaderAccessor accessor) throws IOException {
        User user = registry.get(accessor.getSessionId());
        Files.write(Path.of("canvas.png"), imageBytes);
        System.out.println("File written");
    }

    @Scheduled(fixedDelay = 10000)
    private void IntervalRequestSnapShotDebug(){
        System.out.println("Request debug entered");
        for(SimpUser user : principalRegistry.getUsers()) {
            Principal userPrincipal = user.getPrincipal();

            if(userPrincipal != null ) {
                User player = registry.get(userPrincipal.getName());

                if(player != null) {
                    System.out.println("Sent request to: " + player.getName());
                    webSocketManager.requestSnapshot(userPrincipal.getName());
                }
            }
        }
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
