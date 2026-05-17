package net.paintstation.Paint.lobby.dto.websocket;

import net.paintstation.Paint.lobby.enums.RoomAction;

public record RoomUpdate(
        RoomAction action,
        String name
) {
}
