package com.linksee.ws.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.reactive.socket.WebSocketSession
import java.util.concurrent.ConcurrentHashMap

/**
 * 会话管理服务。
 *
 * 维护三层映射（全部使用 [ConcurrentHashMap] 保证线程安全）：
 * - `sessionId → WebSocketSession` — 连接与会话的映射
 * - `userId → sessionId` — 用户与连接的映射，用于私聊路由
 * - `userId → Set<friendId>` — 好友列表，用于上/下线通知
 *
 * 所有状态为内存存储，服务重启后丢失。同一用户重复连接时，旧映射会被覆盖。
 */
@Service
class SessionManager {

    private companion object {
        private val log = LoggerFactory.getLogger(SessionManager::class.java)
    }

    /** [sessionId] → [WebSocketSession] */
    private val sessions = ConcurrentHashMap<String, WebSocketSession>()

    /** [userId] → [sessionId]（同一用户仅保留最新连接） */
    private val userSessions = ConcurrentHashMap<Long, String>()

    /** [sessionId] → [userId] 反向映射，O(1) 反查 */
    private val sessionToUser = ConcurrentHashMap<String, Long>()

    /** [userId] → 好友 ID 集合 */
    private val userFriends = ConcurrentHashMap<Long, Set<Long>>()

    /**
     * 注册新 WebSocket 连接。
     *
     * @param session 客户端 WebSocket 会话
     */
    fun addSession(session: WebSocketSession) {
        sessions[session.id] = session
        log.info("Session added: ${session.id}, total: ${sessions.size}")
    }

    /**
     * 移除连接，同时清理对应的用户映射。
     *
     * @param sessionId 待移除的 session ID
     */
    fun removeSession(sessionId: String) {
        sessions.remove(sessionId)
        val userId = sessionToUser.remove(sessionId)
        if (userId != null) userSessions.remove(userId)
        log.info("Session removed: $sessionId, total: ${sessions.size}")
    }

    /**
     * 将用户 ID 绑定到当前连接。
     *
     * @param sessionId WebSocket session ID
     * @param userId 业务用户 ID
     */
    fun bindUser(sessionId: String, userId: Long) {
        val oldSessionId = userSessions[userId]
        if (oldSessionId != null) {
            sessionToUser.remove(oldSessionId)
        }
        userSessions[userId] = sessionId
        sessionToUser[sessionId] = userId
        log.debug("User $userId bound to session $sessionId")
    }

    /**
     * 设置用户的好友列表。
     *
     * 好友列表由客户端在 AUTH 消息中传入，用于后续上线/下线通知。
     *
     * @param userId 用户 ID
     * @param friendIds 好友 ID 集合
     */
    fun setFriends(userId: Long, friendIds: Set<Long>) {
        userFriends[userId] = friendIds
        log.debug("User $userId has ${friendIds.size} friends")
    }

    /**
     * 获取用户的好友 ID 列表。
     *
     * @param userId 用户 ID
     * @return 好友 ID 集合，无好友数据时返回空集合
     */
    fun getFriendIds(userId: Long): Set<Long> = userFriends[userId] ?: emptySet()

    /**
     * 判断用户是否在线。
     *
     * @param userId 用户 ID
     * @return `true` 表示该用户存在活跃连接
     */
    fun isUserOnline(userId: Long): Boolean = userSessions.containsKey(userId)

    /**
     * 获取用户当前在线的好友 ID 集合。
     *
     * @param userId 用户 ID
     * @return 同时满足「是好友」且「在线」的用户 ID 集合
     */
    fun getOnlineFriends(userId: Long): Set<Long> {
        val friendIds = userFriends[userId] ?: return emptySet()
        return friendIds.filter { isUserOnline(it) }.toSet()
    }

    /**
     * 根据 sessionId 查找 WebSocket 会话。
     *
     * @param sessionId WebSocket session ID
     * @return 对应的 [WebSocketSession]，不存在时返回 `null`
     */
    fun getSession(sessionId: String): WebSocketSession? = sessions[sessionId]

    /**
     * 根据 userId 查找其 WebSocket 会话（用于私聊投递）。
     *
     * @param userId 业务用户 ID
     * @return 该用户的 [WebSocketSession]，不在线时返回 `null`
     */
    fun getSessionByUser(userId: Long): WebSocketSession? {
        val sessionId = userSessions[userId] ?: return null
        return sessions[sessionId]
    }

    /**
     * 根据 sessionId 反查 userId。
     *
     * @param sessionId WebSocket session ID
     * @return 绑定的用户 ID，未绑定时返回 `null`
     */
    fun getUserId(sessionId: String): Long? = sessionToUser[sessionId]

    /**
     * 当前在线连接总数。
     *
     * @return 活跃的 WebSocket session 数量
     */
    fun getOnlineCount(): Int = sessions.size
}
