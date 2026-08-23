package net.paintstation.Paint.room;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.lobby.dto.internal.RoomInfo;
import net.paintstation.Paint.lobby.enums.AccessRoomStatus;
import net.paintstation.Paint.lobby.enums.AddPlayerStatus;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

public class Room {
    private final String name;
    private final String password;
    private final String owner;
    private int numOfPlayers = 0;
    private boolean snapshotPending = false;
    private final HashMap<String, String> players = new HashMap<>();
    public ConcurrentLinkedQueue<PaintResponse> history = new ConcurrentLinkedQueue<>();
    public ConcurrentLinkedQueue<PaintResponse> previousHistory = new ConcurrentLinkedQueue<>();
    private int historyCount = 0;
    private final Object playersLock = new Object();
    private final Object historyLock = new Object();

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

    public List<PaintResponse> getHistory(){
        return List.copyOf(history);
    }

    public boolean addPaintObject(PaintResponse response){
        synchronized(historyLock) {
            history.add(response);
            historyCount++;

            if(historyCount >= 50){
                previousHistory = history;
                history = new ConcurrentLinkedQueue<>();
                historyCount = 0;
                snapshotPending = true;
                return true;
            }
            return false;
        }
    }

    public String[] getAllPlayerNames(){
        return players.keySet().toArray(String[]::new);
    }

    public String[] getAllPlayerIds(){
        return players.values().toArray(String[]::new);
    }

    public String idToPlayer(String id){
        for (Map.Entry<String, String> entry : players.entrySet()) {
            if (Objects.equals(id, entry.getValue())) {
                return entry.getKey();
            }
        }
        return "";
    }

    public boolean isNameTaken(String name){
        return players.containsKey(name);
    }

    public boolean isFull(){
        return numOfPlayers == 4;
    }

    public boolean isEmpty() {return numOfPlayers == 0;}

    public AddPlayerStatus addPlayer(String playerName) {
        synchronized(playersLock) {
            if (isFull()) return AddPlayerStatus.ROOM_FULL;
            if (isNameTaken(playerName)) return AddPlayerStatus.USERNAME_TAKEN;
            players.put(playerName, null);
            numOfPlayers++;
            return AddPlayerStatus.SUCCESS;
        }
    }

    public void registerPlayer(String username, String id){
        synchronized(playersLock) {
            players.put(username, id);
        }
    }

    public boolean removePlayer(String username){
        synchronized(playersLock) {
            boolean removed = players.remove(username) != null;
            if (!removed) {
                return false;
            }
            numOfPlayers--;
            return true;
        }
    }

    public RoomInfo getRoomInfo(){
        return new RoomInfo(this.name, this.numOfPlayers);
    }

    public boolean isSnapshotRequested() {
        return snapshotPending;
    }

    public int getHistoryCount(){
        return historyCount;
    }
}
