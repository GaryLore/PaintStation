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

    ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();

    public synchronized boolean InsertRoom(Room room) {
        Room previousRoom = rooms.putIfAbsent(room.getName(), room);
        return previousRoom == null;
    }

    public Optional<Room> findRoomByName(String roomName){
        return Optional.ofNullable(rooms.get(roomName));
    }

    public List<RoomInfo> getAllRoomsInfo(){
        return rooms.values()
                .stream()
                .map(Room::getRoomInfo)
                .toList();
    }
}



