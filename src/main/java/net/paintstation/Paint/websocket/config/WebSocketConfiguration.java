package net.paintstation.Paint.websocket.config;

import net.paintstation.Paint.websocket.JwtHandshakeInterceptor;
import net.paintstation.Paint.websocket.MyChannelInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    private TaskScheduler messageBrokerTaskScheduler;
    private final MyChannelInterceptor channelInterceptor;
    private final JwtHandshakeInterceptor handshakeInterceptor;

    WebSocketConfiguration(MyChannelInterceptor channelInterceptor, JwtHandshakeInterceptor handshakeInterceptor){
        this.channelInterceptor = channelInterceptor;
        this.handshakeInterceptor = handshakeInterceptor;
    }

    @Autowired
    public void setMessageBrokerTaskScheduler(@Qualifier("messageBrokerTaskScheduler") @Lazy TaskScheduler taskScheduler) {
        this.messageBrokerTaskScheduler = taskScheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic")
                .setHeartbeatValue(new long[] {10000, 10000})
                .setTaskScheduler(this.messageBrokerTaskScheduler);
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(handshakeInterceptor);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(channelInterceptor);
    }

}