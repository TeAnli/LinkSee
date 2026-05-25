package com.linksee.ws.model

/**
 * 客户端 → 服务端 消息类型。
 *
 * 客户端发送 JSON 的 `type` 字段必须取以下值之一，否则服务端返回 [OutboundType.ERROR]。
 */
enum class InboundType {
    /** 绑定用户身份。payload: `{ userId: Long, friendIds?: List<Long> }` */
    AUTH,
    /** 加入频道。payload: `{ channelId: Long }` */
    JOIN_CHANNEL,
    /** 离开频道。payload: `{ channelId: Long }` */
    LEAVE_CHANNEL,
    /** 频道消息。payload: `{ channelId: Long, content: String }` */
    CHAT_MESSAGE,
    /** 私聊消息。payload: `{ targetUserId: Long, content: String }` */
    DM_MESSAGE,
    /** 心跳保活。payload 可为 `null` */
    PING,
}

/**
 * 服务端 → 客户端 消息类型。
 *
 * 客户端根据 `type` 字段区分消息并更新 UI。
 */
enum class OutboundType {
    /** 心跳响应，payload 为 ISO-8601 时间戳字符串 */
    PONG,
    /** 频道消息广播。payload: `{ channelId, senderSessionId, content, timestamp }` */
    CHAT_MESSAGE,
    /** 私聊消息。payload: `{ senderSessionId, content, timestamp }` */
    DM_MESSAGE,
    /** 有用户加入频道。payload: `{ sessionId, channelId, onlineCount }` */
    USER_JOINED,
    /** 有用户离开频道。payload: `{ sessionId, channelId, onlineCount }` */
    USER_LEFT,
    /** 好友上线。payload: `{ userId: Long, timestamp: String }` */
    FRIEND_ONLINE,
    /** 好友下线。payload: `{ userId: Long, timestamp: String }` */
    FRIEND_OFFLINE,
    /** AUTH 后返回当前在线好友。payload: `{ onlineFriendIds: List<Long> }` */
    ONLINE_FRIENDS,
    /** 错误消息，payload 为错误描述字符串 */
    ERROR,
}
