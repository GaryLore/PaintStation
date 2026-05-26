package net.paintstation.Paint.livepaint.Models;

public record Dot(
    String color,
    int width,
    Point point
) implements PaintObject {
    @Override
    public String getType() {
        return "DOT";
    }
}
