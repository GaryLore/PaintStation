package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.livepaint.Models.Dot;
import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.Models.Stroke;
import net.paintstation.Paint.livepaint.dto.PaintRequest;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.livepaint.dto.UsernameRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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

        PaintObject paintObject = request.object();
        String type = "";
        if(paintObject instanceof Stroke){
            type = "STROKE";
        }
        else if(paintObject instanceof Dot) {
            type = "DOT";
        }

        PaintResponse response = new PaintResponse(type, username, paintObject);
        return response;
    }

    @PostMapping("/api/username")
    @ResponseBody
    public String getUserName(@RequestBody UsernameRequest request){

        return paintService.getUsernameOfRoom(request.userID(), request.roomID());
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
