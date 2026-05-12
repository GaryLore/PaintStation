package net.paintstation.Paint.dto.internal;

import net.paintstation.Paint.enums.AccessRoomStatus;
import net.paintstation.Paint.Models.Room;

public record AccessRoomResult(AccessRoomStatus status, Room room) {

    public static AccessRoomResult success(Room room) {
        return new AccessRoomResult(AccessRoomStatus.SUCCESS, room);
    }

    public static AccessRoomResult failure(AccessRoomStatus status) {
        return new AccessRoomResult(status, null);
    }
}