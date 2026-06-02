package net.paintstation.Paint.Config;

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

    MyChannelInterceptor(RoomSafetyService service){
        this.service = service;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        switch(command){
            case SEND -> {

                //access room
                //access user

                //check if user has access to the room
            }
            case SUBSCRIBE -> {
                System.out.println("SOMEONE SUBSCRIBED");
                String destination = accessor.getDestination();

                if (destination != null && destination.startsWith("/topic/room/")) {
                    String roomName = extractRoomName(destination);

                    //check if valid uuid userID
                    try {
                        UUID userID = UUID.fromString(Objects.requireNonNull(accessor.getFirstNativeHeader("userID")));

                        //check if room exists
                        if(!service.roomExist(roomName)){
                            //return some error
                        }
                        //check if userID exists in room
                        if(!service.userIDExistsInRoom(userID, roomName)){
                            //return some error
                        }

                        //set principal associated with session
                    }
                    catch(Exception ignored){
                        // return some error;
                    }
                }
            }
            case DISCONNECT -> {

                System.out.println("SOMEONE DISCONNECTED");

            }
            case null -> {
                System.out.println("STOMP COMMAND was NULL");
            }
            default -> {}
        }
        return message;
    }

    private String extractRoomName(String destination) {
        return destination.replace("/topic/room/", "");
    }
}
