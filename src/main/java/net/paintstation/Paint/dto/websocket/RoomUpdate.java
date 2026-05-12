package net.paintstation.Paint.dto.websocket;

import net.paintstation.Paint.enums.RoomAction;

public record RoomUpdate(
        RoomAction action,
        String name
) {
}
