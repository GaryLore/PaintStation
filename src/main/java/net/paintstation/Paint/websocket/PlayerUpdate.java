package net.paintstation.Paint.websocket;

public record PlayerUpdate(
        String type,
        String action,
        String user
) {
}
