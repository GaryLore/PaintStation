package net.paintstation.Paint.registry;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PlayerRegistry {

    private final ConcurrentHashMap<String, User> players = new ConcurrentHashMap<>();
    private final Set<String> chatUsers = new HashSet<>();//UNSURE but this maybe able to remove this

    public void add(String sessionId, User player) {
        players.put(sessionId, player);
    }

    public User get(String sessionId) {
        return players.get(sessionId);
    }

    public void remove(String sessionId) {
        players.remove(sessionId);
    }

    public boolean contains(String sessionId){return players.containsKey(sessionId); }

    public void addChatUser(String sessionId){
        chatUsers.add(sessionId);
    }

    public void removeChatUser(String sessionId){
        chatUsers.remove(sessionId);
    }

    public boolean containsChatUser(String sessionId){
        return chatUsers.contains(sessionId);
    }

    public int totalPeopleInRooms(){
        return players.size();
    }

}