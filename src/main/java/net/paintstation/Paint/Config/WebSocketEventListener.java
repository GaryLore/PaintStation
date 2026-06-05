package net.paintstation.Paint.Config;

import net.paintstation.Paint.Registry.PlayerRegistry;
import net.paintstation.Paint.Registry.User;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Component
public class WebSocketEventListener {

    private final SimpMessagingTemplate template;
    private final PlayerRegistry registry;
    private final RoomSafetyService service;

    public WebSocketEventListener(SimpMessagingTemplate template, PlayerRegistry registry, RoomSafetyService service) {
        this.template = template;
        this.registry = registry;
        this.service = service;
    }

    @EventListener
    public void handleSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        if (destination != null && destination.startsWith("/topic/room/")) {
            System.out.println("[" + accessor.getDestination() + "]");
            String sessionId = accessor.getSessionId();
            User user = registry.get(sessionId);
            template.convertAndSend("/topic/room/" + user.getRoomName(), new PlayerUpdate("PLAYER_UPDATE", "ADD", user.getName()));
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        User user = registry.get(sessionId);

        if(user != null) {//we only register users once they enter a room not if they subscribe to the lobby
            service.cleanUp(user);
            registry.remove(sessionId);
            template.convertAndSend("/topic/room/" + user.getRoomName(), new PlayerUpdate("PLAYER_UPDATE", "REMOVE", user.getName()));
        }
    }
}
