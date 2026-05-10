package net.paintstation.Paint.Repository;

import net.paintstation.Paint.Models.Room;
import net.paintstation.Paint.Models.RoomInfo;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class DashboardRepository {


    ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();

    public boolean InsertRoom(Room room) {

        Room previousRoom = rooms.putIfAbsent(room.getName(), room);
        return previousRoom == null;

    }

    public Optional<Room> findRoom(String roomName){
        return Optional.ofNullable(rooms.get(roomName));
    }

    public List<RoomInfo> getAllRoomsInfo(){

        return rooms.values()
                .stream()
                .map(Room::getRoomInfo)
                .toList();
    }
}



