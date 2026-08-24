package net.paintstation.Paint.room;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import net.paintstation.Paint.livepaint.Models.PaintObject;
import net.paintstation.Paint.livepaint.Models.Stroke;
import net.paintstation.Paint.livepaint.dto.PaintResponse;
import net.paintstation.Paint.lobby.dto.internal.RoomInfo;
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
    public HashMap<UUID, ConcurrentLinkedQueue<PaintResponse>> fillHistory = new HashMap<>();
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
        if(!snapshotPending){
            return List.copyOf(history);
        }
        else{
            //used just in case when initializing room and current snapshot is getting processed
            //so we use old snapshot and previous history, maybe glitch here idk
            return List.copyOf(previousHistory);
        }
    }

    public boolean addPaintObject(PaintResponse response){
        synchronized(historyLock) {
            history.add(response);
            PaintObject object = response.object();

            if(object.getType().equals("STROKE")){
                Stroke stroke = (Stroke) response.object();
                System.out.println(stroke.toDebugString());

                UUID id = stroke.uuid();
                if(stroke.fill()){
                    if (fillHistory.containsKey(id)){
                        ConcurrentLinkedQueue<PaintResponse> fillStroke = fillHistory.get(id);
                        fillStroke.add(response);
                    }
                    else if(fillHistory.containsKey(id) && stroke.phase().equals("END")){
                        fillHistory.remove(id);
                    }
                    else{
                        ConcurrentLinkedQueue<PaintResponse> fillStroke = new ConcurrentLinkedQueue<PaintResponse>();
                        fillStroke.add(response);
                        fillHistory.put(id, fillStroke);
                    }
                }
            }
            historyCount++;

            if(historyCount >= 50){
                previousHistory = history;
                history = new ConcurrentLinkedQueue<>();
                //sometimes fill strokes are cut off after a snapshot so we need to reinsert them
                historyCount = 0;
                for (ConcurrentLinkedQueue<PaintResponse> fillStroke : fillHistory.values()) {
                    history.addAll(fillStroke);
                    historyCount += fillStroke.size(); //not efficient because of size O(n) lookup
                }
                if(historyCount >= 50){
                    System.out.println("PAINT FILL STROKE IS TOOO BIGG");
                    //short term fix but we need some way of limiting how big a fill paint stroke is.
                    history.clear();
                }
                snapshotPending = true;
                return true;
            }
            return false;
        }
    }

    public void debugPaintObject(PaintObject object){
        System.out.println(object.getType());
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
