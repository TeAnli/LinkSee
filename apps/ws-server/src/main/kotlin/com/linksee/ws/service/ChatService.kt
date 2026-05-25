package com.linksee.ws.service

import com.linksee.ws.model.OutboundMessage
import com.linksee.ws.model.OutboundType
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

/**
 * 聊天业务服务 — 处理所有入站消息类型的业务逻辑。
 *
 * 每个方法接收已解析的 payload，编排 [SessionManager]、[ChannelService]、
 * [HeartbeatManager] 完成状态变更，最后通过 [MessageSender] 推送响应消息。
 *
 * ## 消息类型
 * | 入站类型 | 对应方法 | 核心业务 |
 * |---------|---------|---------|
 * | `AUTH` | [handleAuth] | 用户身份绑定 + 好友在线通知 |
 * | `PING` | [handlePing] | 心跳记录 + PONG 回复 |
 * | `JOIN_CHANNEL` | [handleJoinChannel] | 加入频道 + 广播 |
 * | `LEAVE_CHANNEL` | [handleLeaveChannel] | 离开频道 + 广播 |
 * | `CHAT_MESSAGE` | [handleChatMessage] | 频道消息广播 |
 * | `DM_MESSAGE` | [handleDmMessage] | 私聊投递 + 回显 |
 * | (断线) | [handleDisconnect] | 好友下线通知 + 频道清理 |
 */
@Service
class ChatService(
    private val sessionManager: SessionManager,
    private val channelService: ChannelService,
    private val heartbeatManager: HeartbeatManager,
    private val messageSender: MessageSender,
) {

    private companion object {
        private val log = LoggerFactory.getLogger(ChatService::class.java)
    }

    private fun now() = Instant.now().toString()

    private fun notifyFriends(userId: Long, type: OutboundType) {
        val onlineFriends = sessionManager.getOnlineFriends(userId)
        onlineFriends.forEach { friendId ->
            sessionManager.getSessionByUser(friendId)?.let { friendSession ->
                messageSender.sendToSession(friendSession.id, OutboundMessage(
                    type = type.name,
                    payload = mapOf("userId" to userId, "timestamp" to now()),
                ))
            }
        }
    }

    // ---- 消息处理器 ----

    fun handleAuth(sessionId: String, payload: Map<String, Any?>?) {
        val userId = (payload?.get("userId") as? Number)?.toLong()
        if (userId == null) {
            messageSender.sendError(sessionId, "AUTH requires userId")
            return
        }

        sessionManager.bindUser(sessionId, userId)

        @Suppress("UNCHECKED_CAST")
        val friendIds = (payload["friendIds"] as? List<Number>)
            ?.mapNotNull { it.toLong() }
            ?.toSet() ?: emptySet()
        sessionManager.setFriends(userId, friendIds)

        log.info("Session $sessionId authenticated as user $userId with ${friendIds.size} friends")

        notifyFriends(userId, OutboundType.FRIEND_ONLINE)

        messageSender.sendToSession(sessionId, OutboundMessage(
            type = OutboundType.ONLINE_FRIENDS.name,
            payload = mapOf("onlineFriendIds" to sessionManager.getOnlineFriends(userId).toList()),
        ))
    }

    fun handlePing(sessionId: String) {
        heartbeatManager.recordHeartbeat(sessionId)
        messageSender.sendToSession(sessionId, OutboundMessage(
            type = OutboundType.PONG.name,
            payload = now(),
        ))
    }

    fun handleJoinChannel(sessionId: String, payload: Map<String, Any?>?) {
        val channelId = (payload?.get("channelId") as? Number)?.toLong() ?: return
        channelService.joinChannel(channelId, sessionId)

        messageSender.broadcastToChannel(channelId, OutboundMessage(
            type = OutboundType.USER_JOINED.name,
            payload = mapOf(
                "sessionId" to sessionId,
                "channelId" to channelId,
                "onlineCount" to channelService.getOnlineCount(channelId),
            )
        ), excludeSession = sessionId)
    }

    fun handleLeaveChannel(sessionId: String, payload: Map<String, Any?>?) {
        val channelId = (payload?.get("channelId") as? Number)?.toLong() ?: return
        channelService.leaveChannel(channelId, sessionId)

        messageSender.broadcastToChannel(channelId, OutboundMessage(
            type = OutboundType.USER_LEFT.name,
            payload = mapOf(
                "sessionId" to sessionId,
                "channelId" to channelId,
                "onlineCount" to channelService.getOnlineCount(channelId),
            )
        ), excludeSession = sessionId)
    }

    fun handleChatMessage(sessionId: String, payload: Map<String, Any?>?) {
        val channelId = (payload?.get("channelId") as? Number)?.toLong() ?: return
        val content = payload["content"] as? String ?: return

        messageSender.broadcastToChannel(channelId, OutboundMessage(
            type = OutboundType.CHAT_MESSAGE.name,
            payload = mapOf(
                "channelId" to channelId,
                "senderSessionId" to sessionId,
                "content" to content,
                "timestamp" to now(),
            )
        ), excludeSession = sessionId)
    }

    fun handleDmMessage(sessionId: String, payload: Map<String, Any?>?) {
        val targetUserId = (payload?.get("targetUserId") as? Number)?.toLong() ?: return
        val content = payload["content"] as? String ?: return

        val targetSession = sessionManager.getSessionByUser(targetUserId)
        val out = OutboundMessage(
            type = OutboundType.DM_MESSAGE.name,
            payload = mapOf(
                "senderSessionId" to sessionId,
                "content" to content,
                "timestamp" to now(),
            )
        )

        if (targetSession != null) {
            messageSender.sendToSession(targetSession.id, out)
        }
        messageSender.sendToSession(sessionId, out)
    }

    fun handleDisconnect(sessionId: String) {
        val userId = sessionManager.getUserId(sessionId)

        if (userId != null) {
            notifyFriends(userId, OutboundType.FRIEND_OFFLINE)
        }

        channelService.leaveAllChannels(sessionId)
        heartbeatManager.removeSession(sessionId)
    }
}
