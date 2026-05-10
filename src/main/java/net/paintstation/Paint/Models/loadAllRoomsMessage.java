package net.paintstation.Paint.Models;

import java.util.List;

public record loadAllRoomsMessage(
        List<RoomInfo> rooms
) {

}
