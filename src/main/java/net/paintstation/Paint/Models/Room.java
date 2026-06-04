package net.paintstation.Paint.Models;

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
    private final UUID ownerID;
    private int numOfPlayers = 1;
    private final HashMap<UUID, String> idToPlayer = new HashMap<>();
    private final ConcurrentLinkedQueue<Integer> history = new ConcurrentLinkedQueue<>();

    @JsonCreator
    public Room(@JsonProperty("username") String name, @JsonProperty("password") String password, @JsonProperty("owner") String owner) {
        this.name = name;
        this.password = password;
        this.owner = owner;
        this.ownerID = UUID.randomUUID();
        this.idToPlayer.put(ownerID, owner);
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

    public List<Integer> getHistory(){
        return List.copyOf(history);
    }

    public String[] getAllPlayerNames(){
        return idToPlayer.values().toArray(new String[0]);
    }

    private synchronized boolean isNameTaken(String name){
        for (String player : idToPlayer.values()) {
            if(Objects.equals(name, player)){
                return true;
            }
        }
        return false;
    }

    public boolean isUserIdInRoom(UUID userID){
        return idToPlayer.containsKey(userID);
    }

    private boolean isFull(){
        return numOfPlayers == 4;
    }

    public synchronized AccessRoomStatus addPlayer(UUID playerId, String playerName) {

        if (isFull()) return AccessRoomStatus.ROOM_FULL;
        if (isNameTaken(playerName)) return AccessRoomStatus.NAME_TAKEN;
        idToPlayer.put(playerId, playerName);
        numOfPlayers++;
        return AccessRoomStatus.SUCCESS;
    }

    public synchronized boolean removePlayer(UUID playerId){
        String value = idToPlayer.remove(playerId);
        if(value == null){
            return false;
        }
        numOfPlayers--;
        return true;
    }

    public UUID getPlayerID(String name){
        for (Map.Entry<UUID, String> entry : idToPlayer.entrySet()) {
            if(Objects.equals(name, entry.getValue() )){
                return entry.getKey();
            }
        }
        return null;
    }

    public String getPlayerName(UUID id){
        return idToPlayer.get(id);
    }

    public RoomInfo getRoomInfo(){
        return new RoomInfo(this.name, this.numOfPlayers);
    }
}
