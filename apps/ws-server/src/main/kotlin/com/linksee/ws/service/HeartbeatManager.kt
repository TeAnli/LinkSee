package com.linksee.ws.service

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.reactive.socket.CloseStatus
import org.springframework.web.reactive.socket.WebSocketSession
import java.util.concurrent.ConcurrentHashMap

/**
 * 心跳超时管理。
 *
 * 每个 session 的最近心跳时间记录在 [lastPing]，
 * 定时任务每 30 秒扫描一次，关闭超过 60 秒无心跳的连接。
 *
 * 被关闭的 session 触发 [ChatWebSocketHandler] 的 `doFinally` → 正常清理。
 */
@Component
@EnableScheduling
class HeartbeatManager(
    private val sessionManager: SessionManager,
) {

    private companion object {
        private val log = LoggerFactory.getLogger(HeartbeatManager::class.java)
        private const val HEARTBEAT_TIMEOUT_MS = 60_000L
        private val STALE_CLOSE = CloseStatus(4001, "Heartbeat timeout")
    }

    /** sessionId → 最后一次心跳时间 (System.currentTimeMillis) */
    private val lastPing = ConcurrentHashMap<String, Long>()

    /**
     * 记录心跳时间（PING 消息到达时由 [MessageRouter] 调用）。
     */
    fun recordHeartbeat(sessionId: String) {
        lastPing[sessionId] = System.currentTimeMillis()
    }

    /**
     * 移除心跳记录（连接断开清理时由 [MessageRouter] 调用）。
     */
    fun removeSession(sessionId: String) {
        lastPing.remove(sessionId)
    }

    /**
     * 每 30 秒检查一次，关闭超时的连接。
     */
    @Scheduled(fixedRate = 30_000)
    fun checkStaleSessions() {
        val now = System.currentTimeMillis()
        val stale = lastPing.entries.filter { now - it.value > HEARTBEAT_TIMEOUT_MS }

        stale.forEach { (sessionId, _) ->
            log.warn("Closing stale session: $sessionId")
            val session = sessionManager.getSession(sessionId)
            if (session != null && session.isOpen) {
                session.close(STALE_CLOSE).subscribe()
            }
        }
    }
}
