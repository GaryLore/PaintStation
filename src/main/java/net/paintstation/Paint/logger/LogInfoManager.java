package net.paintstation.Paint.logger;

import net.paintstation.Paint.registry.PlayerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LogInfoManager {

    private final Logger logger = LoggerFactory.getLogger(LogInfoManager.class);
    //all connections
    private final SimpUserRegistry userRegistry;
    //I manage and only connectiosn to people in a room
    private final PlayerRegistry playerRegistry;

    public LogInfoManager(SimpUserRegistry userRegistry, PlayerRegistry playerRegistry) {
        this.userRegistry = userRegistry;
        this.playerRegistry = playerRegistry;
    }

    public void createRoom(String roomName, String ownerName, boolean hasPassword){
        logger.info(
                "CREATED ROOM room=[{}] owner=[{}] hasPassword=[{}]",
                roomName,
                ownerName,
                hasPassword
        );
    }

    public void deleteRoom(String roomName){
        logger.info(
                "DELETED ROOM room=[{}]",
                roomName
        );
    }

    public void userGotJwtToJoinRoom(String roomName, String username){
        logger.info(
                "USER GOT JWT TO JOIN ROOM room=[{}] user=[{}]",
                roomName,
                username
        );
    }

    public void userJoinedRoom(String roomName, String username){
        logger.info(
                "USER JOINED ROOM room=[{}] user=[{}]",
                roomName,
                username
        );
    }

    public void userLeftRoom(String roomName, String username){
        logger.info(
                "USER LEFT ROOM room=[{}] user=[{}]",
                roomName,
                username
        );
    }

    private void displayStats(int numOfUsers, int numOfUsersInLobby, int numOfUsersInRooms){
        logger.info(
                "TOTAL USERS ON SITE={} TOTAL USERS LOBBY={} TOTAL USERS IN THE ROOMS={}",
                numOfUsers,
                numOfUsersInLobby,
                numOfUsersInRooms
        );
    }

    /**
     * Displays stats of num of users in total, in rooms, and in lobby and if there is 0 we skip it
     */
    @Scheduled(fixedDelay = 60_000)
    public void callDisplayStats(){
        int numOfUsers = userRegistry.getUserCount();
        if(numOfUsers == 0){
            return;
        }
        int numOfUsersInRooms = playerRegistry.totalPeopleInRooms();
        int numOfUsersInLobby = numOfUsers - numOfUsersInRooms;
        displayStats(numOfUsers, numOfUsersInLobby, numOfUsersInRooms);
    }
}
