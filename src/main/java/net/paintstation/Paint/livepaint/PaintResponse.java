package net.paintstation.Paint.livepaint;

public record PaintResponse(
        String type,
        String user,
        PaintObject object
) {
}
