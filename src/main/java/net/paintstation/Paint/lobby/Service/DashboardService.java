package net.paintstation.Paint.lobby.Service;

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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.TaskScheduler;
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

    DashboardService(RoomRepository repository, @Qualifier("taskScheduler") TaskScheduler scheduler, WebSocketManager webSocketManager){
        this.repository = repository;
        this.scheduler = scheduler;
        this.webSocketManager = webSocketManager;
    }

    /**
     * Creates a room with the request information if possible
     *
     * @param request The information required to create a room
     * @return An optional that is either empty on failure or contains a room on success
     */
    public Optional<Room> createRoom(CreateRoomRequest request) {
        Room room = new Room(
                request.roomName(),
                request.password(),
                request.ownerName()
        );

        System.out.println("[DashboardService.java] Room Name : \"" + request.roomName() + "\"");
        System.out.println("[DashboardService.java] Password : \"" + request.password() + "\"");
        System.out.println("[DashboardService.java] Owner Name : \"" + request.ownerName() + "\"");

        boolean success = repository.InsertRoom(room);
        if (success) {
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
        String password = request.password();

        Optional<Room> room = repository.findRoomByName(roomName);

        if(room.isEmpty()){
            return AccessRoomResult.failure(AccessRoomStatus.ROOM_NOT_FOUND);
        }

        Room accessedRoom = room.get();
        boolean passwordCorrect = accessedRoom.isPasswordCorrect(password.trim());

        if (!passwordCorrect) {
            return AccessRoomResult.failure(AccessRoomStatus.INCORRECT_PASSWORD);
        }

        if(accessedRoom.isFull()){
            return AccessRoomResult.failure(AccessRoomStatus.ROOM_FULL);
        }

        if(accessedRoom.isNameTaken(username)){
            return AccessRoomResult.failure(AccessRoomStatus.NAME_TAKEN);
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
            System.out.println("DELETED EMPTY ROOM");
            repository.removeRoom(room.getName());
            webSocketManager.broadcastRoomUpdate(new RoomUpdate(RoomAction.DELETE, room.getName()));
        }
    }
}
