package net.paintstation.Paint.websocket;

import net.paintstation.Paint.Registry.PlayerRegistry;
import net.paintstation.Paint.Registry.User;
import net.paintstation.Paint.jwt.JwtUtil;
import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
public class MyChannelInterceptor implements ChannelInterceptor {

    private final RoomSafetyService service;
    private final PlayerRegistry registry;
    private final JwtUtil jwtUtil;

    public MyChannelInterceptor(RoomSafetyService service, PlayerRegistry registry, JwtUtil jwtUtil){
        this.service = service;
        this.registry = registry;
        this.jwtUtil = jwtUtil;
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

                    if(!service.roomExist(roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }
                    if(!service.userExistsInRoom(user.getName(), roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }
                }
            }
            case SUBSCRIBE -> {
                String destination = accessor.getDestination();

                if (destination != null && destination.startsWith("/topic/room/")) {

                    String roomName = extractRoomName(destination);

                    //check if room exists
                    String token = (String) accessor.getSessionAttributes().get("jwt");
                    if (token == null) throw new RuntimeException("ACCESS DENIED");

                    String tokenRoomName = getRoomFromCookie(token);
                    if(!roomName.equals(tokenRoomName) || !service.roomExist(roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }

                    String username = jwtUtil.extractUsername(token);
                    if(service.isRoomFull(roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }

                    //set registry associated with session id
                    User user = new User(username, roomName);
                    registry.add(accessor.getSessionId(), user);
                }
                //don't want user connecting to stomp routes that dont exist
                else if(destination == null || !destination.equals("/topic/update")){
                    throw new RuntimeException("ACCESS DENIED");
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

    private String getRoomFromCookie(String token){
        return jwtUtil.extractClaim(token, claims -> claims.get("room")).toString();
    }
}
