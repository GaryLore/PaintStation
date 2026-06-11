package net.paintstation.Paint.websocket;

import net.paintstation.Paint.Registry.User;
import net.paintstation.Paint.RoomRepository.Room;
import net.paintstation.Paint.RoomRepository.RoomRepository;
import net.paintstation.Paint.lobby.dto.websocket.RoomUpdate;
import net.paintstation.Paint.lobby.enums.RoomAction;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RoomSafetyService {

    private final RoomRepository repository;

    RoomSafetyService(RoomRepository repository){
        this.repository = repository;
    }

    public boolean roomExist(String name){
        return repository.containsRoom(name);
    }

    public boolean userExistsInRoom(String username, String roomName){
        return repository.userExistsInRoom(username, roomName);
    }

    public boolean isRoomFull(String roomName){
        Optional<Room> room = repository.findRoomByName(roomName);

        if(room.isPresent()){
            Room actualRoom = room.get();
            return actualRoom.isFull();
        }
        return true;
    }

    public void addPlayer(String roomName, String player){
        repository.findRoomByName(roomName).map(room -> room.addPlayer(player));
    }

    public void cleanUp(User user, SimpMessagingTemplate template){
        if(user == null) return;
        String roomName = user.getRoomName();
        Optional<Room> room = repository.findRoomByName(roomName);
        room.ifPresent(elRoom -> {
            elRoom.removePlayer(user.getName());
            if(elRoom.isEmpty()){
                repository.removeRoom(roomName);
                RoomUpdate update = new RoomUpdate(RoomAction.DELETE, user.getRoomName());
                template.convertAndSend("/topic/update", update);
            }
        });
    }


}
