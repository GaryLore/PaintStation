package net.paintstation.Paint.dto.request;

import jakarta.validation.constraints.Size;

public record JoinRoomRequest(
        @Size(min = 1, max = 10)
        String username,
        @Size(min = 0, max = 64)
        String password
) {
    public JoinRoomRequest {
        System.out.println(username + " [" + password + "]");
        username = username != null ? username.trim() : null;
        password = password != null ? password.trim() : null;
    }
}
