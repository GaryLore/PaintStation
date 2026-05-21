package net.paintstation.Paint.livepaint.Models;

import java.util.UUID;

public record Stroke(
        String phase,
        UUID uuid,
        String brushColor,
        String bucketColor,
        int width,
        Point[] points,
        boolean fill
) implements PaintObject {
}
