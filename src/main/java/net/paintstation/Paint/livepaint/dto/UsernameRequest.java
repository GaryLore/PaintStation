package net.paintstation.Paint.livepaint.dto;

import java.util.UUID;

public record UsernameRequest(
        UUID roomID,
        UUID userID
) {
}
