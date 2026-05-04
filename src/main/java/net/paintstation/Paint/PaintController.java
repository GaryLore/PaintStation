package net.paintstation.Paint;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaintController {

    @GetMapping("/room")
    String enterRoom(){
        return "forward:/room.html";
    }


}
