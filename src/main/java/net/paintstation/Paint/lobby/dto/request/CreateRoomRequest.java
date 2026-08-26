package net.paintstation.Paint.lobby.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(
        @NotBlank(message = "roomName is required")
        @Size(min = 5, max = 25, message = "length must be at least 5 character and at most 25 characters")
        @Pattern(regexp = "^[a-zA-Z0-9 ]+$", message = "Must only contain letters, numbers and spaces")
        String roomName,
        @NotBlank(message = "roomName is required")
        @Size(min = 1, max = 10, message = "length must be at least 1 character and at most 10 characters")
        String ownerName,
        @Size(min = 0, max = 64, message = "length must be a max of 64 characters")
        String password
) {
    public CreateRoomRequest {
        roomName = roomName != null ? roomName.trim() : null;
        ownerName = ownerName != null ? ownerName.trim() : null;
        password = password != null ? password.trim() : null;
    }
}