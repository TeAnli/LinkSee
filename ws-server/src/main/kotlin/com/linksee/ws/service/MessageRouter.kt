package com.linksee.ws.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.linksee.ws.model.InboundMessage
import com.linksee.ws.model.InboundType
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Sinks

/**
 * 消息路由服务 — 入站消息解析与分发。
 *
 * 职责：
 * - 为 [ChatWebSocketHandler][com.linksee.ws.handler.ChatWebSocketHandler] 提供 Sink 注册
 * - 解析入站 JSON → [InboundMessage] → 按 [InboundType] 分发到 [ChatService]
 * - 编排断线后的完整清理流程
 *
 * 业务逻辑全部委托给 [ChatService]，消息推送全部委托给 [MessageSender]。
 */
@Service
class MessageRouter(
    private val objectMapper: ObjectMapper,
    private val chatService: ChatService,
    private val messageSender: MessageSender,
    private val heartbeatManager: HeartbeatManager,
    private val sessionManager: SessionManager,
) {

    private companion object {
        private val log = LoggerFactory.getLogger(MessageRouter::class.java)
    }

    /**
     * 为新连接注册出站通道。
     *
     * @param sessionId WebSocket session ID
     * @return 该连接的 [Sinks.Many] 实例
     */
    fun registerSink(sessionId: String): Sinks.Many<String> {
        heartbeatManager.recordHeartbeat(sessionId)
        return messageSender.registerSink(sessionId)
    }

    /**
     * 入站消息路由入口。
     *
     * 流程：JSON 解析 → [InboundType] 校验 → 分发到 [ChatService] 对应 handler。
     * 解析失败或类型未知时返回错误，不中断连接。
     */
    fun route(sessionId: String, raw: String) {
        val msg: InboundMessage = try {
            objectMapper.readValue(raw)
        } catch (e: Exception) {
            messageSender.sendError(sessionId, "Invalid JSON: ${e.message}")
            return
        }

        val type = try {
            InboundType.valueOf(msg.type)
        } catch (e: Exception) {
            messageSender.sendError(sessionId, "Unknown message type: ${msg.type}")
            return
        }

        try {
            when (type) {
                InboundType.AUTH -> chatService.handleAuth(sessionId, msg.payload)
                InboundType.PING -> chatService.handlePing(sessionId)
                InboundType.JOIN_CHANNEL -> chatService.handleJoinChannel(sessionId, msg.payload)
                InboundType.LEAVE_CHANNEL -> chatService.handleLeaveChannel(sessionId, msg.payload)
                InboundType.CHAT_MESSAGE -> chatService.handleChatMessage(sessionId, msg.payload)
                InboundType.DM_MESSAGE -> chatService.handleDmMessage(sessionId, msg.payload)
            }
        } catch (e: Exception) {
            log.error("Error handling message type=$type from session=$sessionId", e)
            messageSender.sendError(sessionId, "Internal error: ${e.message}")
        }
    }

    /**
     * 连接断开时的完整清理：
     * 1. 业务层清理（好友通知 + 退出频道 + 移除心跳） — 委托 [ChatService]
     * 2. 基础设施清理（移除 Sink + 移除 Session） — 本层负责
     */
    fun handleDisconnect(sessionId: String) {
        chatService.handleDisconnect(sessionId)
        messageSender.removeSink(sessionId)
        sessionManager.removeSession(sessionId)
    }
}
