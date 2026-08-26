package net.paintstation.Paint.room;

import net.paintstation.Paint.lobby.dto.internal.RoomInfo;
import net.paintstation.Paint.lobby.enums.AddPlayerStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;


import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomRepository {

    private final ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();
    private final JdbcClient jdbcClient;

    public RoomRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public boolean InsertRoom(Room room) {
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

    public AddPlayerStatus addPlayer(String roomName, String player){
        Optional<AddPlayerStatus> result = findRoomByName(roomName).map(room -> room.addPlayer(player));
        return result.orElse(AddPlayerStatus.ROOM_NOT_FOUND);
    }

    public void addSnapshot(String roomName, byte[] imageBytes){
        jdbcClient.sql("UPDATE Room SET image = :image WHERE room_name = :room_name")
                .param("room_name", roomName)
                .param("image", imageBytes)
                .update();
    }

    public byte[] getSnapshot(String roomName){
        return jdbcClient.sql("SELECT image FROM Room WHERE room_name = :room_name")
                .param("room_name", roomName)
                .query(byte[].class)
                .optional()
                .orElse(null);
    }

    public boolean checkIfRoomExist(String roomName){
        return jdbcClient.sql("SELECT EXISTS (SELECT 1 FROM Room WHERE room_name = :room_name)")
                .param("room_name", roomName)
                .query(Boolean.class)
                .single();
    }

    public void removeRoomFromDatabase(String roomName){
        jdbcClient.sql("DELETE FROM Room WHERE room_name = :room_name")
                .param("room_name", roomName)
                .update();
    }

    public void addRoomToDatabase(String roomName){
        jdbcClient.sql("INSERT INTO Room (room_name, image) VALUES (:room_name, :image)")
                .param("room_name", roomName)
                .param("image", (byte[]) null)
                .update();
    }

    public int howManyRoomsExist(){
        return jdbcClient.sql("SELECT COUNT(*) FROM Room;")
                .query(Integer.class)
                .single();
    }
}



