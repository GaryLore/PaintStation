package net.paintstation.Paint.websocket.config;

import net.paintstation.Paint.websocket.JwtHandshakeInterceptor;
import net.paintstation.Paint.websocket.MyChannelInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

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

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(7 * 1024 * 1024);//originally 8192 but we need it big for init
        container.setMaxBinaryMessageBufferSize(5 * 1024 * 1024);
        return container;
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(7 * 1024 * 1024); //default 64 x 1024
    }

    @Autowired
    public void setMessageBrokerTaskScheduler(@Qualifier("messageBrokerTaskScheduler") @Lazy TaskScheduler taskScheduler) {
        this.messageBrokerTaskScheduler = taskScheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[] {10000, 10000})
                .setTaskScheduler(this.messageBrokerTaskScheduler);
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins(
                        "https://paintstation.io",
                        "https://www.paintstation.io"
                );
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(channelInterceptor);
    }

}