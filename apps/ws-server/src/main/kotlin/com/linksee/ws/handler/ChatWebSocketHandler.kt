package com.linksee.ws.handler

import com.linksee.ws.service.MessageRouter
import com.linksee.ws.service.SessionManager
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono

/**
 * WebSocket 连接处理器。
 *
 * 每个连接的生命周期：
 * 1. 注册 session → [SessionManager]
 * 2. 创建 [Sink][reactor.core.publisher.Sinks.Many] 作为出站推送通道
 * 3. 入站帧交由 [MessageRouter] 路由分发
 * 4. 连接关闭时由 [MessageRouter.handleDisconnect] 统一清理
 *
 * 入站与出站通过 [Mono.when] 并行订阅，任一流完成则连接结束。
 */
@Component
class ChatWebSocketHandler(
    private val sessionManager: SessionManager,
    private val messageRouter: MessageRouter,
) : WebSocketHandler {

    private companion object {
        private val log = LoggerFactory.getLogger(ChatWebSocketHandler::class.java)
    }

    /**
     * 处理新 WebSocket 连接。
     *
     * @param session 代表与单个客户端的 WebSocket 会话
     * @return [Mono] 连接结束时完成的响应式流
     */
    override fun handle(session: WebSocketSession): Mono<Void> {
        log.info("WebSocket connected: ${session.id}")

        sessionManager.addSession(session)

        val sink = messageRouter.registerSink(session.id)

        // 入站消息处理
        val inbound = session.receive()
            .doOnNext { message ->
                messageRouter.route(session.id, message.payloadAsText)
            }
            .doFinally { _ ->
                cleanUp(session.id)
            }
            .then()
        // 出站消息处理
        val outbound = session.send(
            sink.asFlux().map { session.textMessage(it) }
        )

        return Mono.`when`(inbound, outbound)
    }

    /**
     * 连接关闭时的清理入口，全部委托给 [MessageRouter.handleDisconnect]。
     *
     * @param sessionId 已关闭连接的 session ID
     */
    private fun cleanUp(sessionId: String) {
        log.info("WebSocket disconnected: $sessionId")
        messageRouter.handleDisconnect(sessionId)
    }
}
