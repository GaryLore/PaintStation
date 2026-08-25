package net.paintstation.Paint.websocket;

import net.paintstation.Paint.websocket.dto.PlayerUpdate;
import net.paintstation.Paint.websocket.dto.RoomUpdate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketManager {

    public static final String TOPIC_LOBBY = "/topic/lobby";
    public static final String TOPIC_ROOM_PREFIX = "/topic/room/";
    public static final String PUBLISH_ROOM_PREFIX = "/app/room/";
    public static final String QUEUE_PAINT_SNAPSHOT = "/queue/paint/snapshot";
    public static final String APP_PAINT_SNAPSHOT = "/app/paint/snapshot";
    public static final String APP_ROOM_PREFIX = "/app/room/";
    private final SimpMessagingTemplate template;

    public WebSocketManager(SimpMessagingTemplate template) {
        this.template = template;
    }

    public void broadcastRoomUpdate(RoomUpdate update){
        template.convertAndSend(TOPIC_LOBBY, update);
    }

    public void broadcastUserUpdate(String room, PlayerUpdate update){
        template.convertAndSend(TOPIC_ROOM_PREFIX + room + "/" + "paint", update);
    }

    public void requestSnapshot(String user){
        template.convertAndSendToUser(user, QUEUE_PAINT_SNAPSHOT, "SNAPSHOT_REQUEST");
    }
}