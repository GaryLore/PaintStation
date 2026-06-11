package net.paintstation.Paint.lobby.dto.response;

import java.util.List;
import java.util.UUID;

public record RoomResponse(
        String roomName,
        String username
) { }
