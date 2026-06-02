package net.paintstation.Paint.lobby.dto.response;

import java.util.List;
import java.util.UUID;

public record RoomResponse(
        String roomName,
        UUID playerID,
        String owner,
        String[] players,
        List<Integer> history
) { }
