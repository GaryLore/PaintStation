package net.paintstation.Paint.livepaint;

import jakarta.validation.Valid;
import net.paintstation.Paint.registry.PlayerRegistry;
import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.dto.PaintRequest;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.registry.User;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.websocket.dto.PlayerUpdate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

/**
 * Handles the websocket requests and responses for live paint
 */
@Controller
public class PaintSocketController {

    private final PlayerRegistry registry;
    private final RoomRepository repository;

    public PaintSocketController(PlayerRegistry registry, RoomRepository repository) {
        this.registry = registry;
        this.repository = repository;
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
        String username = registry.get(accessor.getSessionId()).getName();
        PaintResponse response = new PaintResponse(paintObject.getType(), username, paintObject);
        return response;
    }

    @MessageMapping("/room/{roomName}/join")
    @SendTo("/topic/room/{roomName}/paint")
    private PlayerUpdate joinRoom(@DestinationVariable String roomName, SimpMessageHeaderAccessor accessor){
        User user = registry.get(accessor.getSessionId());
        /*
        if user is null that means player was never added to registry on sessionSubscribe which means this could be an attack
        to add a user in a room they are not in, so we drop the message and dont add the user
        */
        if(user == null){
            return null;
        }
        repository.addPlayer(user.getRoomName(), user.getName());
        System.out.println("[WebSocketEventListener.java] " + "\"" + user.getName() + "\"" + " SUBSCRIBED TO ROOM: " + "\"" + user.getRoomName() + "\"");
        return new PlayerUpdate("PLAYER_UPDATE", "ADD", user.getName());
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
