package net.paintstation.Paint.dto.response;

import net.paintstation.Paint.dto.internal.RoomInfo;

import java.util.List;

public record loadAllRoomsResponse(
        List<RoomInfo> rooms
) {

}
