package net.paintstation.Paint.Models;

import jakarta.validation.constraints.Size;

public record JoinRoomRequest(
        @Size(min = 5, max = 25)
        String name,
        @Size(min = 0, max = 64)
        String password
) {
    public JoinRoomRequest {
        name = name != null ? name.trim() : null;
        password = password != null ? password.trim() : null;
    }
}
