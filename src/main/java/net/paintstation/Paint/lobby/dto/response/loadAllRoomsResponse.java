package net.paintstation.Paint.lobby.dto.response;

import net.paintstation.Paint.lobby.dto.internal.RoomInfo;

import java.util.List;

public record loadAllRoomsResponse(
        List<RoomInfo> rooms
) {

}
