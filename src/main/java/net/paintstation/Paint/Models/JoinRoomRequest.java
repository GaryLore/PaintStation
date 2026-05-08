package net.paintstation.Paint.Models;

import jakarta.validation.constraints.Size;

public record JoinRoomRequest(
        @Size(min = 5, max = 25)
        String name,
        String password
) {
    public JoinRoomRequest {
        name = name.trim();
        password = password.trim();
    }
}
