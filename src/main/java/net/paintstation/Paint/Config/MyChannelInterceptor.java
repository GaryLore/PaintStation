package net.paintstation.Paint.Config;

import net.paintstation.Paint.Registry.PlayerRegistry;
import net.paintstation.Paint.Registry.User;
import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

import java.util.Objects;
import java.util.UUID;

public class MyChannelInterceptor implements ChannelInterceptor {

    private final RoomSafetyService service;
    private final PlayerRegistry registry;

    MyChannelInterceptor(RoomSafetyService service, PlayerRegistry registry){
        this.service = service;
        this.registry = registry;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        switch(command){
            case SEND -> {
                String destination = accessor.getDestination();
                if (destination != null && destination.startsWith("/topic/room/")) {
                    String roomName = extractRoomName(destination);
                    User user = registry.get(accessor.getSessionId());
                    UUID userID = user.getUserID();

                    if(!service.roomExist(roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }
                    if(!service.userIDExistsInRoom(userID, roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }
                }
            }
            case SUBSCRIBE -> {
                String destination = accessor.getDestination();

                if (destination != null && destination.startsWith("/topic/room/")) {
                    String roomName = extractRoomName(destination);

                    //check if valid uuid userID
                    try {
                        UUID userID = UUID.fromString(Objects.requireNonNull(accessor.getFirstNativeHeader("userID")));

                        //check if room exists
                        if(!service.roomExist(roomName)){
                            throw new RuntimeException("ACCESS DENIED");
                        }
                        //check if userID exists in room
                        if(!service.userIDExistsInRoom(userID, roomName)){
                            throw new RuntimeException("ACCESS DENIED");
                        }

                        //set registry associated with session id
                        String username = service.getUsername(userID, roomName);
                        User user = new User(username, userID, roomName);
                        registry.add(accessor.getSessionId(), user);
                    }
                    catch(Exception ignored){
                        throw new RuntimeException("ACCESS DENIED");
                    }
                }
            }
            case null -> {}
            default -> {}
        }
        return message;
    }

    private String extractRoomName(String destination) {
        return destination.replace("/topic/room/", "");
    }
}
