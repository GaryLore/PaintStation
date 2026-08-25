package net.paintstation.Paint.websocket;

import net.paintstation.Paint.lobby.enums.AddPlayerStatus;
import net.paintstation.Paint.registry.PlayerRegistry;
import net.paintstation.Paint.registry.User;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.room.RoomSafetyService;
import net.paintstation.Paint.jwt.JwtUtil;
import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
public class MyChannelInterceptor implements ChannelInterceptor {

    private final RoomSafetyService service;
    private final PlayerRegistry registry;
    private final RoomRepository repository;
    private final JwtUtil jwtUtil;

    public MyChannelInterceptor(RoomSafetyService service, PlayerRegistry registry, RoomRepository repository, JwtUtil jwtUtil){
        this.service = service;
        this.registry = registry;
        this.repository = repository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        //StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );
        StompCommand command = accessor.getCommand();

        switch(command){
            case SEND -> {
                String destination = accessor.getDestination();
                if (destination == null) {
                    System.out.println("desintation is null");
                    throw new RuntimeException("ACCESS DENIED");
                }
                if (destination.startsWith(WebSocketManager.PUBLISH_ROOM_PREFIX) && (destination.endsWith("/paint") || destination.endsWith("/chat")) ) {
                    User user = registry.get(accessor.getSessionId());
                    if (user == null) {
                        System.out.println("user null");
                        throw new RuntimeException("ACCESS DENIED");
                    }
                    //this is not perfect got to check route
                    if(!service.userExistsInRoom(user.getName(), user.getRoomName())){
                        System.out.println("user doesnt exists in room");
                        throw new RuntimeException("ACCESS DENIED");
                    }
                }
                else if(!destination.equals(WebSocketManager.APP_PAINT_SNAPSHOT)) {
                    //client attempting to send anywhere else is denied allows server tho, since this is on inbound channel
                    System.out.println(destination);
                    System.out.println("not allowed to send here");
                    throw new RuntimeException("ACCESS DENIED");
                }
            }
            case SUBSCRIBE -> {
                String destination = accessor.getDestination();
                if (destination == null) {
                    throw new RuntimeException("ACCESS DENIED");
                }
                if (destination.startsWith(WebSocketManager.TOPIC_ROOM_PREFIX) && destination.endsWith("paint")) {

                    String roomName = extractRoomName(destination);

                    //check if room exists
                    String token = (String) accessor.getSessionAttributes().get("jwt");
                    if (token == null) {
                        throw new RuntimeException("ACCESS DENIED");
                    }

                    String tokenRoomName = getRoomFromCookie(token);
                    if(!roomName.equals(tokenRoomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }

                    String username = jwtUtil.extractUsername(token);
                    AddPlayerStatus result = repository.addPlayer(roomName, username);//this checks if room exists as well in order to add it

                    if(result != AddPlayerStatus.SUCCESS){
                        throw new RuntimeException("ACCESS DENIED");
                    }

                    //set registry associated with session id
                    User user = new User(username, roomName);
                    registry.add(accessor.getSessionId(), user);
                }
                else if(destination.startsWith(WebSocketManager.TOPIC_ROOM_PREFIX) && destination.endsWith("chat")){
                    String sessionId = accessor.getSessionId();
                    String roomName = extractRoomName(destination);
                    String token = (String) accessor.getSessionAttributes().get("jwt");

                    if (token == null) {
                        throw new RuntimeException("ACCESS DENIED");
                    }
                    //could throw exception
                    String tokenRoomName = getRoomFromCookie(token);
                    if(!roomName.equals(tokenRoomName) || !service.roomExist(roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }
                    //dont want to add user to chat twice
                    if(registry.containsChatUser(sessionId)){
                        throw new RuntimeException("ACCESS DENIED");
                    }

                    registry.addChatUser(sessionId);
                    //System.out.println("SUBSCRIPTION TO CHAT: " + destination );
                }
                //relies on paint subscription set up finishing first may implement receipts in the future could result in bug
                else if(destination.startsWith(WebSocketManager.APP_ROOM_PREFIX) && destination.endsWith("init")){
                    //SOME OF THIS IS REPEATED you may need METHOD
                    String roomName = extractRoomName(destination);

                    //check if room exists
                    String token = (String) accessor.getSessionAttributes().get("jwt");
                    if (token == null) {
                        throw new RuntimeException("ACCESS DENIED");
                    }

                    String tokenRoomName = getRoomFromCookie(token);
                    String username = jwtUtil.extractUsername(token);

                    //System.out.println("DOES USER EXIST IN ROOM: " + service.roomExist(roomName));
                    if(!roomName.equals(tokenRoomName) || !service.userExistsInRoom(username, roomName)){
                        throw new RuntimeException("ACCESS DENIED");
                    }

                }
                //don't want user connecting to stomp routes that dont exist
                else if(!destination.equals(WebSocketManager.TOPIC_LOBBY) && !destination.equals("/user" + WebSocketManager.QUEUE_PAINT_SNAPSHOT)){
                    throw new RuntimeException("ACCESS DENIED");
                }

            }
            case CONNECT -> {
                StompPrincipal principal = new StompPrincipal(accessor.getSessionId());
                accessor.setUser(principal);
            }
            case null -> {}
            default -> {}
        }
        return message;
    }

    //doesnt work for send frames only subscribe
    private String extractRoomName(String destination) {
        final int PAINT_SUFFIX_LENGTH = 6; // "/paint"
        final int CHAT_SUFFIX_LENGTH = 5; // "/chat"
        final int INIT_SUFFIX_LENGTH = 5; // "/init"
        final int SNAPSHOT_SUFFIX_LENGTH = 8; // "snapshot"

        String roomName = null;
        if(destination.endsWith("/paint")){
            roomName = destination.substring(WebSocketManager.TOPIC_ROOM_PREFIX.length(), destination.length() - PAINT_SUFFIX_LENGTH);
        }
        else if(destination.endsWith("/chat")){
            roomName = destination.substring(WebSocketManager.TOPIC_ROOM_PREFIX.length(), destination.length() - CHAT_SUFFIX_LENGTH);
        }
        else if(destination.endsWith("/init")){
            roomName = destination.substring(WebSocketManager.APP_ROOM_PREFIX.length(), destination.length() - INIT_SUFFIX_LENGTH);
        }
        else if(destination.endsWith("/snapshot")){
            roomName = destination.substring(WebSocketManager.TOPIC_ROOM_PREFIX.length(), destination.length() - SNAPSHOT_SUFFIX_LENGTH);
        }
        return roomName;
    }

    private String getRoomFromCookie(String token){
        return jwtUtil.extractClaim(token, claims -> claims.get("room")).toString();
    }
}
