package net.paintstation.Paint.lobby.dto.internal;

import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.lobby.enums.AccessRoomStatus;

public record AccessRoomResult(AccessRoomStatus status, Room room) {

    public static AccessRoomResult success(Room room) {
        return new AccessRoomResult(AccessRoomStatus.SUCCESS, room);
    }

    public static AccessRoomResult failure(AccessRoomStatus status) {
        return new AccessRoomResult(status, null);
    }
}