package net.paintstation.Paint.livepaint.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.UUID;

public record PaintSetupRequest(
        @NotEmpty
        String roomName,
        String username
) {
}
