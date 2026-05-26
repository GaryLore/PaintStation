package net.paintstation.Paint.livepaint.dto;

import net.paintstation.Paint.livepaint.Models.PaintObject;

import java.util.UUID;

public record PaintRequest(
        UUID userID,
        PaintObject object
) {
}
