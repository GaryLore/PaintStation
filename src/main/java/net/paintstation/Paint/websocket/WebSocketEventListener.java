package net.paintstation.Paint.websocket;

import net.paintstation.Paint.Registry.PlayerRegistry;
import net.paintstation.Paint.Registry.User;
import net.paintstation.Paint.websocket.dto.PlayerUpdate;
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

        if (destination != null && destination.startsWith(PlayerRegistry.TOPIC_ROOM_PREFIX) && destination.endsWith("paint")) {
            String sessionId = accessor.getSessionId();
            User user = registry.get(sessionId);
            service.addPlayer(user.getRoomName(), user.getName());
            System.out.println("[WebSocketEventListener.java] " + "\"" + user.getName() + "\"" + " SUBSCRIBED TO ROOM: " + "\"" + user.getRoomName() + "\"");
            template.convertAndSend(PlayerRegistry.TOPIC_ROOM_PREFIX + user.getRoomName() + "/" + "paint", new PlayerUpdate("PLAYER_UPDATE", "ADD", user.getName()));
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        User user = registry.get(sessionId);

        //paint cleanup
        if(user != null) {//we only register users once they enter a room not if they subscribe to the lobby
            service.cleanUp(user, template);
            registry.remove(sessionId);
            System.out.println("[WebSocketEventListener.java] " + "\"" + user.getName() + "\"" + " DISCONNECTED FROM ROOM: " + "\"" + user.getRoomName() + "\"");
            template.convertAndSend(PlayerRegistry.TOPIC_ROOM_PREFIX + user.getRoomName() + "/" + "paint", new PlayerUpdate("PLAYER_UPDATE", "REMOVE", user.getName()));
        }
        //chat cleanup
        if(registry.containsChatUser(sessionId)){
            registry.removeChatUser(sessionId);
        }

    }
}
