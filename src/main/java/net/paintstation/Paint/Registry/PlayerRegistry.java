package net.paintstation.Paint.Registry;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class PlayerRegistry {
    private final ConcurrentHashMap<String, User> players = new ConcurrentHashMap<>();

    public void add(String sessionId, User player) {
        players.put(sessionId, player);
    }

    public User get(String sessionId) {
        return players.get(sessionId);
    }

    public void remove(String sessionId) {
        players.remove(sessionId);
    }

}