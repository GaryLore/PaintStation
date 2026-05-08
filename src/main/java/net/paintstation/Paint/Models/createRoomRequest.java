package net.paintstation.Paint.Models;

public record createRoomRequest(
        String roomName,
        String ownerName,
        String password
) { }
