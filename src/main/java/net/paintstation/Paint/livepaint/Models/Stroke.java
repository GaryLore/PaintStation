package net.paintstation.Paint.livepaint.Models;

import jakarta.validation.constraints.NotEmpty;

import java.util.UUID;

public record Stroke(
        UUID uuid,
        @NotEmpty
        String phase,
        @NotEmpty
        String brushColor,
        String bucketColor,
        int width,
        Point[] points,
        boolean fill
) implements PaintObject {
    @Override
    public String getType() {
        return "STROKE";
    }
}
