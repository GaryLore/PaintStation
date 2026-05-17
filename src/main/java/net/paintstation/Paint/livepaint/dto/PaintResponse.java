package net.paintstation.Paint.livepaint.dto;

import net.paintstation.Paint.livepaint.Models.PaintObject;

public record PaintResponse(
        String type,
        String user,
        PaintObject object
) {
}
