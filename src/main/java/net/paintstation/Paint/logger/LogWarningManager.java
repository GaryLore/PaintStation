package net.paintstation.Paint.logger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LogWarningManager {

    private final Logger logger = LoggerFactory.getLogger(LogWarningManager.class);

    public void warning(String message){
        logger.warn(message);
    }
}
