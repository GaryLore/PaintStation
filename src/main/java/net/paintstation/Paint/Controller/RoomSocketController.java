package net.paintstation.Paint.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class RoomSocketController {

    private SimpMessagingTemplate template;

    @Autowired
    public RoomSocketController(SimpMessagingTemplate template) {
        this.template = template;
    }

}
