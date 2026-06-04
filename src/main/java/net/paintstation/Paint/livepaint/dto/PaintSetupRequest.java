package net.paintstation.Paint.livepaint.dto;

import java.util.UUID;

public record PaintSetupRequest(
        String roomName,
        UUID userID
) {
}
