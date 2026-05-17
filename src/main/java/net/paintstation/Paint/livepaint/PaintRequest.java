package net.paintstation.Paint.livepaint;

import java.util.UUID;

public record PaintRequest(
        UUID userID,
        PaintObject object
) {
}
