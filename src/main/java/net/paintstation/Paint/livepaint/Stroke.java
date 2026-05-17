package net.paintstation.Paint.livepaint;

public record Stroke(
        String brushColor,
        String bucketColor,
        int width,
        Point[] points,
        boolean fill
) implements PaintObject {
}
