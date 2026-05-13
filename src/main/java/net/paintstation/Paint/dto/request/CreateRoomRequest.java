package net.paintstation.Paint.dto.request;

import jakarta.validation.constraints.Size;

public record CreateRoomRequest(
        @Size(min = 5, max = 25)
        String roomName,
        @Size(min = 1, max = 10)
        String ownerName,
        @Size(min = 0, max = 64)
        String password
) {
    public CreateRoomRequest {
        roomName = roomName != null ? roomName.trim() : null;
        ownerName = ownerName != null ? ownerName.trim() : null;
        password = password != null ? password.trim() : null;
    }
}