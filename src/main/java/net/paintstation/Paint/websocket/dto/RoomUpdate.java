package net.paintstation.Paint.websocket.dto;

import net.paintstation.Paint.lobby.enums.RoomAction;

public record RoomUpdate(
        RoomAction action,
        String name,
        Boolean hasPassword
) {
}
