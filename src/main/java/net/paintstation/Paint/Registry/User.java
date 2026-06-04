package net.paintstation.Paint.Registry;

import java.util.UUID;

public class User{

    private final String name;
    private final UUID userID;
    private final String roomName;

    public User(String name, UUID userID, String roomName){
        this.name = name;
        this.userID = userID;
        this.roomName = roomName;
    }

    public String getName() {
        return name;
    }

    public UUID getUserID(){
        return userID;
    }

    public String getRoomName(){
        return roomName;
    }
}
