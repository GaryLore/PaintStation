package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.dto.PaintRequest;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class PaintSocketController {

    private final PaintService paintService;

    public PaintSocketController(PaintService paintService) {
        this.paintService = paintService;
    }

    @MessageMapping("/room/{roomName}")
    @SendTo("/topic/room/{roomName}")
    public PaintResponse broadcastStroke(@DestinationVariable String roomName, PaintRequest request){
        String username = paintService.getUsernameOfRoom(request.userID(), roomName);
        PaintObject paintObject = request.object();
        PaintResponse response = new PaintResponse(paintObject.getType(), username, paintObject);
        return response;
    }

    private static void debugRequest(PaintRequest request) {
        System.out.println("REQUEST");
        System.out.println(request);
        System.out.println("END REQUEST");
    }

    private static void debugResponse(PaintResponse response){
        System.out.println("RESPONSE");
        System.out.println(response);
        System.out.println("END RESPONSE");
    }

}
