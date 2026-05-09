package net.paintstation.Paint.Repository;

import net.paintstation.Paint.Models.Room;
import org.springframework.stereotype.Repository;


import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

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

}



