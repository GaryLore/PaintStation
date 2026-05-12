package net.paintstation.Paint.dto.response;

import java.util.List;

public record RoomResponse(
        String roomID,
        String playerID,
        String owner,
        String[] players,
        List<Integer> history
) { }
