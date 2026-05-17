package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.livepaint.dto.PaintRequest;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class PaintSocketController {

    private final PaintService paintService;

    public PaintSocketController(PaintService paintService) {
        this.paintService = paintService;
    }

    @MessageMapping("/paint/{roomID}")
    @SendTo("/topic/paint/{roomID}")
    public PaintResponse broadcastStroke(@DestinationVariable UUID roomID, PaintRequest request){

        String username = paintService.getUsernameOfRoom(request.userID(), roomID);
        return new PaintResponse(request.type(), username, request.object());
    }

}
