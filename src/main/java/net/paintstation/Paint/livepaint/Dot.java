package net.paintstation.Paint.livepaint;

public record Dot(
    String color,
    int width,
    Point point
) implements PaintObject {
}
