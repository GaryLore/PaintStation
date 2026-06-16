package net.paintstation.Paint.livepaint.Models;

import jakarta.validation.constraints.NotEmpty;

public record Dot(
    @NotEmpty
    String color,
    int width,
    Point point
) implements PaintObject {
    @Override
    public String getType() {
        return "DOT";
    }
}
