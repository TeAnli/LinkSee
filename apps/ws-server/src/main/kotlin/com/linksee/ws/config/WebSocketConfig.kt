package com.linksee.ws.config

import com.linksee.ws.handler.ChatWebSocketHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping
import org.springframework.web.reactive.socket.WebSocketHandler

/**
 * WebSocket 端点配置。
 *
 * 将 `/ws/chat` 路径映射到 [ChatWebSocketHandler]，
 * `order = -1` 确保 WebSocket 映射优先于其他 [HandlerMapping][org.springframework.web.reactive.HandlerMapping]。
 */
@Configuration
class WebSocketConfig(
    private val chatHandler: ChatWebSocketHandler,
) {

    /**
     * 注册 WebSocket 路由映射。
     *
     * @return [SimpleUrlHandlerMapping] 包含 `/ws/chat` → [ChatWebSocketHandler] 的映射
     */
    @Bean
    fun webSocketHandlerMapping(): SimpleUrlHandlerMapping {
        return SimpleUrlHandlerMapping().apply {
            urlMap = mapOf("/ws/chat" to chatHandler as WebSocketHandler)
            order = -1
        }
    }
}
