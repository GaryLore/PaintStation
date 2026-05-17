package net.paintstation.Paint.livepaint;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class PaintSocketController {

    @MessageMapping("/paint/{roomID}")
    @SendTo("/topic/paint/{roomID}")
    public PaintResponse broadcastStroke(@DestinationVariable int roomID, PaintRequest request){

    }

}
