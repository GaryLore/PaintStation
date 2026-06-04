package net.paintstation.Paint.livepaint;

import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/paint")
public class PaintController {

    private final PaintService service;

    public PaintController(PaintService service) {
        this.service = service;
    }

    @PostMapping("/init")
    ResponseEntity<?> setup(@RequestBody PaintSetupRequest request){
        PaintSetupResponse response = service.setup(request);
        if(response != null){
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.notFound().build();
    }
}
