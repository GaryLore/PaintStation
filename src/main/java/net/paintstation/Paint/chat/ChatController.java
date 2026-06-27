package net.paintstation.Paint.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import net.paintstation.Paint.Registry.PlayerRegistry;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.rmi.registry.Registry;

@Controller
public class ChatController {

    private final PlayerRegistry registry;

    public ChatController(PlayerRegistry registry){
        this.registry = registry;
    }

    @MessageMapping("/room/{roomName}/chat")
    @SendTo("/topic/room/{roomName}/chat")
    private Message BroadCastMessage(@Payload(required = false) String text, SimpMessageHeaderAccessor accessor){

        System.out.println("[" + text + "]");
        //if null is returned message isnt sent, default behavior
        if(text == null || text.trim().isEmpty()){
            return null;
        }
        
        String username = registry.get(accessor.getSessionId()).getName();
        return new Message(username, text);
    }
}
