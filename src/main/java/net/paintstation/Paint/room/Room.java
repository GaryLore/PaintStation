package net.paintstation.Paint.room;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import net.paintstation.Paint.lobby.dto.internal.RoomInfo;
import net.paintstation.Paint.lobby.enums.AccessRoomStatus;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

public class Room {
    private final String name;
    private final String password;
    private final String owner;
    private int numOfPlayers = 0;
    private final HashMap<UUID, String> idToPlayer = new HashMap<>();
    private final Set<String> players = new HashSet<>();
    private final ConcurrentLinkedQueue<Integer> history = new ConcurrentLinkedQueue<>();

    @JsonCreator
    public Room(@JsonProperty("username") String name, @JsonProperty("password") String password, @JsonProperty("owner") String owner) {
        this.name = name;
        this.password = password;
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public boolean isPasswordCorrect(String password) {
        return this.password.equals(password);
    }

    public String getOwner() {
        return owner;
    }

    public List<Integer> getHistory(){
        return List.copyOf(history);
    }

    public String[] getAllPlayerNames(){
        return players.toArray(String[]::new);
    }

    public boolean isNameTaken(String name){
        return players.contains(name);
    }

    public boolean isFull(){
        return numOfPlayers == 4;
    }

    public boolean isEmpty() {return numOfPlayers == 0;}

    public synchronized AccessRoomStatus addPlayer(String playerName) {

        if (isFull()) return AccessRoomStatus.ROOM_FULL;
        if (isNameTaken(playerName)) return AccessRoomStatus.NAME_TAKEN;
        players.add(playerName);
        numOfPlayers++;
        return AccessRoomStatus.SUCCESS;
    }

    public synchronized boolean removePlayer(String username){
        boolean removed = players.remove(username);
        if(!removed){
            return false;
        }

        numOfPlayers--;
        return true;
    }

    public RoomInfo getRoomInfo(){
        return new RoomInfo(this.name, this.numOfPlayers);
    }
}
