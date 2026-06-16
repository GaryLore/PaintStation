package net.paintstation.Paint.Registry;

import java.util.UUID;

public class User{

    private final String name;
    private final String roomName;

    public User(String name, String roomName){
        this.name = name;
        this.roomName = roomName;
    }

    public String getName() {
        return name;
    }

    public String getRoomName(){
        return roomName;
    }
}
