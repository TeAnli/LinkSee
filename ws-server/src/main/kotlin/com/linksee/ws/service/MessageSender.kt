package com.linksee.ws.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.linksee.ws.model.OutboundMessage
import com.linksee.ws.model.OutboundType
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Sinks
import java.util.concurrent.ConcurrentHashMap

/**
 * 消息发送服务 — 管理出站通道并执行底层消息推送。
 *
 * 每个 WebSocket 连接对应一个 [Sinks.Many] 实例（`directBestEffort` 策略），
 * 出站消息以 JSON 字符串写入 Sink，由 [ChatWebSocketHandler][com.linksee.ws.handler.ChatWebSocketHandler]
 * 的出站流消费并写入 WebSocket 帧。
 *
 * @property objectMapper JSON 序列化（Jackson）
 * @property channelService 频道成员查询
 */
@Service
class MessageSender(
    private val objectMapper: ObjectMapper,
    private val channelService: ChannelService,
) {

    private companion object {
        private val log = LoggerFactory.getLogger(MessageSender::class.java)
    }

    private val sinks = ConcurrentHashMap<String, Sinks.Many<String>>()

    fun registerSink(sessionId: String): Sinks.Many<String> {
        val sink = Sinks.many().multicast().directBestEffort<String>()
        sinks[sessionId] = sink
        return sink
    }

    fun removeSink(sessionId: String) {
        sinks.remove(sessionId)?.tryEmitComplete()
    }

    fun sendToSession(sessionId: String, message: OutboundMessage) {
        val json = try {
            objectMapper.writeValueAsString(message)
        } catch (e: Exception) {
            log.error("Failed to serialize message", e)
            return
        }
        sinks[sessionId]?.tryEmitNext(json)
    }

    fun sendError(sessionId: String, error: String) {
        sendToSession(sessionId, OutboundMessage(OutboundType.ERROR.name, error))
    }

    fun broadcastToChannel(channelId: Long, message: OutboundMessage, excludeSession: String? = null) {
        val members = channelService.getChannelMembers(channelId)
        val json = try {
            objectMapper.writeValueAsString(message)
        } catch (e: Exception) {
            log.error("Failed to serialize broadcast message", e)
            return
        }
        members.forEach { sessionId ->
            if (sessionId != excludeSession) {
                sinks[sessionId]?.tryEmitNext(json)
            }
        }
    }
}
