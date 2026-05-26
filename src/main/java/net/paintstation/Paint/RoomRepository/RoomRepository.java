package net.paintstation.Paint.RoomRepository;

import net.paintstation.Paint.Models.Room;
import net.paintstation.Paint.lobby.dto.internal.RoomInfo;
import org.springframework.stereotype.Component;


import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomRepository {

    ConcurrentHashMap<UUID, Room> rooms = new ConcurrentHashMap<>();
    ConcurrentHashMap<String, UUID> roomNameToUUID = new ConcurrentHashMap<>();

    public synchronized boolean InsertRoom(Room room) {
        Room previousRoom = rooms.putIfAbsent(room.getRoomID(), room);
        UUID previousUUID = roomNameToUUID.putIfAbsent(room.getName(), room.getRoomID());
        return previousRoom == null && previousUUID == null;
    }

    public Optional<Room> findRoomByName(String roomName){
        Optional<UUID> id = Optional.ofNullable(roomNameToUUID.get(roomName));
        return id.map(uuid -> rooms.get(uuid));
    }

    public Optional<Room> findRoomByUUID(UUID id){
        return Optional.ofNullable(rooms.get(id));
    }

    public List<RoomInfo> getAllRoomsInfo(){
        return rooms.values()
                .stream()
                .map(Room::getRoomInfo)
                .toList();
    }
}



