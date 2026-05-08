package net.paintstation.Paint.Models;

public class AccessRoomResult {
    private final AccessRoomStatus status;
    private final Room room;

    public AccessRoomResult(AccessRoomStatus status, Room room) {

        this.status = status;
        this.room = room;

    }

    public static AccessRoomResult success(Room room) {
        return new AccessRoomResult(AccessRoomStatus.SUCCESS, room);
    }

    public static AccessRoomResult failure(AccessRoomStatus status) {
        return new AccessRoomResult(status, null);
    }

    public AccessRoomStatus getStatus() { return status; }
    public Room getRoom() { return room; }
}