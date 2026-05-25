package com.linksee.ws.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

/**
 * 频道管理服务。
 *
 * 维护频道与成员的映射关系：`channelId → Set<sessionId>`。
 * 一个 session 可同时加入多个频道；断线时自动退出全部频道。
 * 频道在最后一个成员离开后自动销毁。
 */
@Service
class ChannelService {

    private companion object {
        private val log = LoggerFactory.getLogger(ChannelService::class.java)
    }

    /** [channelId] → 成员 [sessionId] 集合 */
    private val channels = ConcurrentHashMap<Long, MutableSet<String>>()

    /**
     * 加入频道。频道不存在时自动创建。
     *
     * @param channelId 频道 ID
     * @param sessionId WebSocket session ID
     */
    fun joinChannel(channelId: Long, sessionId: String) {
        channels.computeIfAbsent(channelId) { ConcurrentHashMap.newKeySet() }.add(sessionId)
        log.info("Session $sessionId joined channel $channelId")
    }

    /**
     * 离开频道。频道为空时自动销毁。
     *
     * @param channelId 频道 ID
     * @param sessionId WebSocket session ID
     */
    fun leaveChannel(channelId: Long, sessionId: String) {
        channels.computeIfPresent(channelId) { _, members ->
            members.remove(sessionId)
            if (members.isEmpty()) null else members
        }
        log.info("Session $sessionId left channel $channelId")
    }

    /**
     * 退出所有已加入的频道（断线清理时调用）。
     *
     * @param sessionId WebSocket session ID
     */
    fun leaveAllChannels(sessionId: String) {
        val emptyChannels = mutableListOf<Long>()
        channels.forEach { (channelId, members) ->
            members.remove(sessionId)
            if (members.isEmpty()) emptyChannels.add(channelId)
        }
        emptyChannels.forEach { channels.remove(it) }
    }

    /**
     * 获取频道内所有成员的 sessionId。
     *
     * @param channelId 频道 ID
     * @return 成员 sessionId 集合
     */
    fun getChannelMembers(channelId: Long): Set<String> = channels[channelId] ?: emptySet()

    /**
     * 获取频道当前在线人数。
     *
     * @param channelId 频道 ID
     * @return 在线成员数
     */
    fun getOnlineCount(channelId: Long): Int = channels[channelId]?.size ?: 0
}
