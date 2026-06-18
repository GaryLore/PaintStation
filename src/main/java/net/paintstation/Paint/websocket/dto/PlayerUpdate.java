package net.paintstation.Paint.websocket.dto;

public record PlayerUpdate(
        String type,
        String action,
        String user
) {
}
