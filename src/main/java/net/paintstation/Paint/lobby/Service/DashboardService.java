package net.paintstation.Paint.lobby.Service;

import net.paintstation.Paint.logger.LogManager;
import net.paintstation.Paint.room.Room;
import net.paintstation.Paint.room.RoomRepository;
import net.paintstation.Paint.lobby.dto.internal.AccessRoomResult;
import net.paintstation.Paint.lobby.dto.request.CreateRoomRequest;
import net.paintstation.Paint.lobby.dto.request.JoinRoomRequest;
import net.paintstation.Paint.lobby.dto.response.loadAllRoomsResponse;
import net.paintstation.Paint.lobby.enums.AccessRoomStatus;
import net.paintstation.Paint.lobby.enums.RoomAction;
import net.paintstation.Paint.websocket.WebSocketManager;
import net.paintstation.Paint.websocket.dto.RoomUpdate;
import org.apache.juli.logging.Log;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

/**
 * Handles more of the logic that the Room Controller needs
 */
@Service
public class DashboardService {

    private final RoomRepository repository;
    private final TaskScheduler scheduler;
    private final WebSocketManager webSocketManager;
    private final PasswordEncoder passwordEncoder;
    private final LogManager logManager;

    DashboardService(RoomRepository repository, @Qualifier("taskScheduler") TaskScheduler scheduler, WebSocketManager webSocketManager, PasswordEncoder passwordEncoder, LogManager logManager){
        this.repository = repository;
        this.scheduler = scheduler;
        this.webSocketManager = webSocketManager;
        this.passwordEncoder = passwordEncoder;
        this.logManager = logManager;
    }

    /**
     * Creates a room with the request information if possible
     *
     * @param request The information required to create a room
     * @return An optional that is either empty on failure or contains a room on success
     */
    public Optional<Room> createRoom(CreateRoomRequest request) {
        String hashedPassword = request.password().isEmpty() ? null : passwordEncoder.encode(request.password());
        Room room = new Room(
                request.roomName(),
                hashedPassword,
                request.ownerName()
        );

        boolean success = repository.InsertRoom(room);
        if (success) {
            repository.addRoomToDatabase(room.getName());
            //removes a created room that was never joined
            scheduler.schedule(
                    () -> expireRoomIfEmpty(room),
                    Instant.now().plusSeconds(10)
            );
            return Optional.of(room);
        }
        else{
            return Optional.empty();
        }
    }

    /**
     * Attempts to access a room with a JoinRoomRequest and the roomName
     * returning the room upon success or on failure returns the corresponding error
     *
     * @param roomName THe name of the room you want to join
     * @param request The information needed to join the room
     * @return The room you wanted to join if successful and the corresponding AccessRoomStatus
     */
    public AccessRoomResult accessRoom(String roomName, JoinRoomRequest request){

        String username = request.username();
        String rawPassword = request.password();

        Optional<Room> room = repository.findRoomByName(roomName);

        if(room.isEmpty()){
            return AccessRoomResult.failure(AccessRoomStatus.ROOM_NOT_FOUND);
        }

        Room accessedRoom = room.get();
        String hashedPassword = accessedRoom.getHashedPassword();
        boolean passwordCorrect = hashedPassword == null || passwordEncoder.matches(rawPassword, hashedPassword);

        if (!passwordCorrect) {
            return AccessRoomResult.failure(AccessRoomStatus.INCORRECT_PASSWORD);
        }

        if(accessedRoom.isFull()){
            return AccessRoomResult.failure(AccessRoomStatus.ROOM_FULL);
        }

        if(accessedRoom.isNameTaken(username)){
            return AccessRoomResult.failure(AccessRoomStatus.USERNAME_TAKEN);
        }

        return AccessRoomResult.success(accessedRoom);
    }

    /**
     * Used in the controller to from a get request to get all the available rooms
     *
     * @return A LoadRoomResponse with all the available rooms you can join
     */
    public loadAllRoomsResponse getAllRooms(){

        return new loadAllRoomsResponse(repository.getAllRoomsInfo());
    }

    /**
     * Deletes a room if its empty scheduled after 10 seconds
     *
     * @param room The Room you are checking
     */
    public void expireRoomIfEmpty(Room room) {
        if(room.isEmpty()) {
            String roomName = room.getName();
            repository.removeRoom(roomName);
            repository.removeRoomFromDatabase(roomName);
            logManager.deleteRoom(roomName);
            webSocketManager.broadcastRoomUpdate(new RoomUpdate(RoomAction.DELETE, roomName, null));
        }
    }
}
