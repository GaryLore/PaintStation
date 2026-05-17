package net.paintstation.Paint.lobby.dto.request;

import jakarta.validation.constraints.Size;

public record JoinRoomRequest(
        @Size(min = 1, max = 10, message = "length must be at least 1 character and at most 10 characters")
        String username,
        @Size(min = 0, max = 64, message = "length must be a max of 64 characters")
        String password
) {
    public JoinRoomRequest {
        System.out.println(username + " [" + password + "]");
        username = username != null ? username.trim() : null;
        password = password != null ? password.trim() : null;
    }
}
