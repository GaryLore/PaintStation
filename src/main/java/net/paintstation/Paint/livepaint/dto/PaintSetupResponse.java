package net.paintstation.Paint.livepaint.dto;

public record PaintSetupResponse (
    String username,
    String roomName,
    String[] players,

) {
}
