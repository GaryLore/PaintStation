package net.paintstation.Paint.dto.response;

import java.util.List;
import java.util.UUID;

public record RoomResponse(
        UUID roomID,
        UUID playerID,
        String owner,
        String[] players,
        List<Integer> history
) { }
