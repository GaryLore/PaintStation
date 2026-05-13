package net.paintstation.Paint.Models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import net.paintstation.Paint.dto.internal.RoomInfo;
import net.paintstation.Paint.enums.AccessRoomStatus;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

public class Room {

    private final UUID roomID;
    private final String name;
    private final String password;
    private final String owner;
    private final UUID ownerID;
    private int numOfPlayers = 1;
    private final HashMap<String, UUID> players = new HashMap<>();
    private final ConcurrentLinkedQueue<Integer> history = new ConcurrentLinkedQueue<>();

    @JsonCreator
    public Room(@JsonProperty("username") String name, @JsonProperty("password") String password, @JsonProperty("owner") String owner) {
        this.name = name;
        this.password = password;
        this.owner = owner;
        this.ownerID = UUID.randomUUID();
        this.players.put(owner, ownerID);
        this.roomID = UUID.randomUUID();
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

    public UUID getOwnerID(){
        return ownerID;
    }

    public UUID getRoomID() {
        return roomID;
    }

    public List<Integer> getHistory(){
        return List.copyOf(history);
    }

    public String[] getPlayers(){
        return players.keySet().toArray(new String[0]);
    }

    private boolean isNameTaken(String name){
        return players.containsKey(name);
    }

    private boolean isFull(){
        return numOfPlayers == 4;
    }

    public synchronized AccessRoomStatus addPlayer(UUID playerId, String playerName) {
        if (isFull()) return AccessRoomStatus.ROOM_FULL;
        if (isNameTaken(playerName)) return AccessRoomStatus.NAME_TAKEN;
        players.put(playerName, playerId);
        numOfPlayers++;
        return AccessRoomStatus.SUCCESS;
    }

    public synchronized UUID getPlayerID(String name){
        System.out.println(players.get(name));
        return players.get(name);
    }

    public RoomInfo getRoomInfo(){
        return new RoomInfo(this.name, this.numOfPlayers);
    }
}
