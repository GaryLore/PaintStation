package net.paintstation.Paint.livepaint.dto;

import jakarta.validation.Valid;
import net.paintstation.Paint.livepaint.Models.PaintObject;

import java.util.UUID;

public record PaintRequest(
        @Valid
        PaintObject object
) {
}
