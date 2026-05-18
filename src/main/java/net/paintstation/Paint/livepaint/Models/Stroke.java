package net.paintstation.Paint.livepaint.Models;

public record Stroke(
        String phase,
        String brushColor,
        String bucketColor,
        int width,
        Point[] points,
        boolean fill
) implements PaintObject {
}
