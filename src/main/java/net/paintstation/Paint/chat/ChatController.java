package net.paintstation.Paint.chat;

import jakarta.validation.Valid;
import net.paintstation.Paint.Registry.PlayerRegistry;
import org.springframework.messaging.handler.annotation.MessageMapping;
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
    private Message BroadCastMessage(String text, SimpMessageHeaderAccessor accessor){

        System.out.println(text);
        String username = registry.get(accessor.getSessionId()).getName();
        return new Message(username, text);
    }
}
