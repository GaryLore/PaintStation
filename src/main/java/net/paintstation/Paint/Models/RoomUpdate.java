package net.paintstation.Paint.Models;

public record RoomUpdate(
        RoomAction action,
        String name
) {
}
