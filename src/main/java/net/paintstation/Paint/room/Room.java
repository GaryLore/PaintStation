package net.paintstation.Paint.room;

import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.Models.Stroke;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.lobby.dto.internal.RoomInfo;
import net.paintstation.Paint.lobby.enums.AddPlayerStatus;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Stream;

public class Room {
    private final String name;
    private final String hashedPassword;
    private final String owner;
    private int numOfPlayers = 0;
    private boolean snapshotPending = false;
    private final HashMap<String, String> players = new HashMap<>();
    private ConcurrentLinkedQueue<PaintResponse> history = new ConcurrentLinkedQueue<>();
    private ConcurrentLinkedQueue<PaintResponse> previousHistory = new ConcurrentLinkedQueue<>();
    private static final int MAX_HISTORY_COUNT = 100;
    private int historyCount = 0;
    private final Object playersLock = new Object();
    private final Object historyLock = new Object();

    public Room(String name, String hashedPassword, String owner) {
        this.name = name;
        this.hashedPassword = hashedPassword;
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public String getHashedPassword(){
        return hashedPassword;
    }

    public String getOwner() {
        return owner;
    }

    public List<PaintResponse> getHistory(){
        synchronized (historyLock) {
            if (snapshotPending) {
                //used just in case when initializing room and current snapshot is getting processed
                //so we use old snapshot and previous history and new history, maybe glitch here idk
                return Stream.concat(previousHistory.stream(), history.stream()).toList();
            } else {
                return List.copyOf(history);
            }
        }
    }

    /**
     * Adds a PaintResponse to history if its either 50 objects or more, or
     * the end of a fill stroke we request a snapshot
     *
     * @param response Contains paint object that is stored in room history
     * @return A boolean that indicates whether a snapshot is needed
     */
    public boolean addPaintObject(PaintResponse response){
        synchronized(historyLock) {
            history.add(response);
            PaintObject object = response.object();
            historyCount++;

            boolean historyLimitReached = historyCount >= MAX_HISTORY_COUNT;
            boolean fillStrokeEnded =
                    object instanceof Stroke stroke
                            && stroke.fill()
                            && "END".equals(stroke.phase());

            if(historyLimitReached || fillStrokeEnded){
                previousHistory = history;
                history = new ConcurrentLinkedQueue<>();
                snapshotPending = true;
                historyCount = 0;
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
        return new RoomInfo(this.name, this.numOfPlayers, hashedPassword != null);
    }

    public boolean isSnapshotPending() {
        return snapshotPending;
    }

    public void setSnapshotFinished(){
        synchronized (historyLock) {
            snapshotPending = false;
        }
    }

    public int getHistoryCount(){
        return historyCount;
    }
}
