package net.paintstation.Paint.livepaint.Models;

import java.util.UUID;

public record Stroke(
        UUID uuid,
        String phase,
        String brushColor,
        String bucketColor,
        int width,
        Point[] points,
        boolean fill
) implements PaintObject {
}
