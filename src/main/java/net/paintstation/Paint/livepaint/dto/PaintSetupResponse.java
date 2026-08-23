package net.paintstation.Paint.livepaint.dto;

import java.util.List;

public record PaintSetupResponse (
    String username,
    String roomName,
    String[] players,
    byte[] imageSnapshot,
    List<PaintResponse> paintResponses
) {
}
