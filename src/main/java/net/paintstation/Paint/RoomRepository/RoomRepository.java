package net.paintstation.Paint.RoomRepository;

import net.paintstation.Paint.lobby.dto.internal.RoomInfo;
import org.springframework.stereotype.Component;


import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomRepository {

    private final ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();

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

    public void removeRoom(String roomName){
        rooms.remove(roomName);
    }

    public boolean containsRoom(String name){
        return rooms.containsKey(name);
    }

    public boolean userExistsInRoom(String username, String roomName){
        return findRoomByName(roomName).map(room -> room.isNameTaken(username)).orElse(false);
    }
}



