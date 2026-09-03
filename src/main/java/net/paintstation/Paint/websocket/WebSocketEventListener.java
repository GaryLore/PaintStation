package net.paintstation.Paint.websocket;

import net.paintstation.Paint.logger.LogInfoManager;
import net.paintstation.Paint.registry.PlayerRegistry;
import net.paintstation.Paint.registry.User;
import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.lobby.enums.RoomAction;
import net.paintstation.Paint.websocket.dto.PlayerUpdate;
import net.paintstation.Paint.websocket.dto.RoomUpdate;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Optional;

@Component
public class WebSocketEventListener {

    private final WebSocketManager webSocketManager;
    private final PlayerRegistry registry;
    private final RoomRepository repository;
    private final LogInfoManager logInfoManager;

    public WebSocketEventListener(WebSocketManager webSocketManager, PlayerRegistry registry, RoomRepository repository, LogInfoManager logInfoManager) {
        this.webSocketManager = webSocketManager;
        this.registry = registry;
        this.repository = repository;
        this.logInfoManager = logInfoManager;
    }

    @EventListener
    public void handleSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();

        if (destination != null && destination.startsWith(WebSocketManager.TOPIC_ROOM_PREFIX) && destination.endsWith("paint")) {
            String sessionId = accessor.getSessionId();
            User user = registry.get(sessionId);
            logInfoManager.userJoinedRoom(user.getRoomName(), user.getName());
            webSocketManager.broadcastUserUpdate(user.getRoomName(), new PlayerUpdate("PLAYER_UPDATE", "ADD", user.getName()) );
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        User user = registry.get(sessionId);
        //paint cleanup
        if(user != null) {//we only register users once they enter a room not if they subscribe to the lobby
            cleanUp(user);
            webSocketManager.broadcastUserUpdate(user.getRoomName(), new PlayerUpdate("PLAYER_UPDATE", "REMOVE", user.getName()) );
            registry.remove(sessionId);
        }
        //chat cleanup
        if(registry.containsChatUser(sessionId)){
            registry.removeChatUser(sessionId);
        }
    }

    private void cleanUp(User user){
        if(user == null) return;
        String roomName = user.getRoomName();
        Optional<Room> room = repository.findRoomByName(roomName);
        room.ifPresent(elRoom -> {
            elRoom.removePlayer(user.getName());
            logInfoManager.userLeftRoom(user.getRoomName(), user.getName());
            if(elRoom.isEmpty()){
                repository.removeRoom(roomName);
                repository.removeRoomFromDatabase(user.getRoomName());
                logInfoManager.deleteRoom(roomName);
                webSocketManager.broadcastRoomUpdate(new RoomUpdate(RoomAction.DELETE, roomName, null));
            }
        });
    }
}
