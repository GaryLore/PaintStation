package net.paintstation.Paint.livepaint;

import jakarta.validation.Valid;
import net.paintstation.Paint.livepaint.dto.PaintSetupRequest;
import net.paintstation.Paint.livepaint.dto.PaintSetupResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * This class handles regular http requests relating to live painting once you are already in a room
 */
@Controller
@RequestMapping("/api/paint")
public class PaintController {

    private final PaintService service;

    public PaintController(PaintService service) {
        this.service = service;
    }

    /**
     * Client sends request here upon loading into the room, and gets a response back to initialize their room
     *
     * @param request a request to initialize the room
     * @return a ResponseEntity containing a PaintSetupResponse to initialize the paint canvas on success,
     *         or 404 Not Found if the room could not be found
     */
    @PostMapping("/init")
    ResponseEntity<?> setup(@Valid @RequestBody PaintSetupRequest request){
        PaintSetupResponse response = service.setup(request);
        if(response != null){
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.notFound().build();
    }
}
