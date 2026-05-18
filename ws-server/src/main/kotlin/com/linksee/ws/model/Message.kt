package com.linksee.ws.model

/**
 * 客户端发送的原始消息。
 *
 * JSON 格式：`{ "type": "AUTH", "payload": { "userId": 1001, "friendIds": [1002] } }`
 *
 * @property type 消息类型，对应 [InboundType] 枚举名
 * @property payload 消息体，字段由具体消息类型决定
 */
data class InboundMessage(
    val type: String,
    val payload: Map<String, Any?>? = null,
)

/**
 * 服务端发送的通用消息。
 *
 * JSON 格式：`{ "type": "FRIEND_ONLINE", "payload": { "userId": 1002, "timestamp": "..." } }`
 *
 * @property type 消息类型，对应 [OutboundType] 枚举名
 * @property payload 消息体，可为字符串或 Map
 */
data class OutboundMessage(
    val type: String,
    val payload: Any? = null,
)
