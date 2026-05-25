# ws-server 实时聊天服务架构文档

> **服务定位**：LinkSee 微服务体系中负责 WebSocket 实时通信的独立服务，提供频道群聊、用户私聊、在线状态追踪与心跳保活能力。

---

## 一、技术栈

| 层级   | 技术                              | 说明                                          |
|------|---------------------------------|---------------------------------------------|
| 语言   | Kotlin 2.3.21                   | 空安全、协程支持、与 Java 生态无缝互操作                     |
| 框架   | Spring Boot 3.5.5 + WebFlux     | 响应式非阻塞 Web 框架，Reactor 编程模型                  |
| 通信协议 | WebSocket (RFC 6455)            | 全双工长连接，基于 Spring WebFlux Reactive WebSocket |
| 序列化  | Jackson + jackson-module-kotlin | JSON 消息序列化/反序列化                             |
| 响应式库 | Project Reactor                 | Mono / Flux / Sinks.Many 出站管道               |
| 并发安全 | ConcurrentHashMap               | 所有内存状态均使用 JUC 并发集合                          |
| 构建工具 | Gradle (Kotlin DSL)             | 声明式依赖管理，JDK 21 工具链                          |
| 监控   | Spring Boot Actuator            | health / metrics / info 端点暴露                |

---

## 二、模块结构p

```
apps/ws-server/
├── build.gradle.kts                              # 构建配置
├── settings.gradle.kts                           # Gradle 设置
└── src/main/
    ├── kotlin/com/linksee/ws/
    │   ├── WsServerApplication.kt                # 启动入口
    │   ├── config/
    │   │   └── WebSocketConfig.kt                # WebSocket 端点注册
    │   ├── handler/
    │   │   └── ChatWebSocketHandler.kt           # 连接生命周期管理
    │   ├── model/
    │   │   ├── MessageProtocol.kt                # 入站/出站消息类型枚举
    │   │   └── Message.kt                        # 消息体 DTO
    │   └── service/
    │       ├── SessionManager.kt                 # 会话与用户映射管理
    │       ├── ChannelService.kt                 # 频道成员关系管理
    │       ├── MessageRouter.kt                  # 消息路由核心（解析→分发→推送）
    │       └── HeartbeatManager.kt               # 心跳超时检测与清理
    └── resources/
        └── application.yml                       # 服务配置
```

---

## 三、分层架构

```
┌──────────────────────────────────────────────────────────────┐
│                      客户端 (Socket.IO)                       │
│                ws://localhost:9000/ws/chat                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Handler 层 (连接管理)                       │
│  ChatWebSocketHandler                                        │
│  · 注册 session → SessionManager                             │
│  · 创建出站 Sink → MessageRouter                             │
│  · 入站帧订阅 → MessageRouter.route()                        │
│  · 出站帧 → Sink.asFlux() → session.send()                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   Router 层 (消息路由核心)                     │
│  MessageRouter                                               │
│  · JSON 解析 → InboundMessage                                │
│  · InboundType 校验 → 分发 handler                           │
│  · 出站 Sink 管理与消息推送                                   │
│  · 断线清理全流程编排                                         │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  SessionManager  │ │ChannelService│ │ HeartbeatManager │
│  (会话/用户映射) │ │ (频道成员)   │ │ (心跳超时检测)   │
│                  │ │              │ │                  │
│ sessionId→Session│ │channelId→    │ │ sessionId→       │
│ userId→sessionId │ │  Set<        │ │  lastPingTime    │
│ userId→friendIds │ │  sessionId>  │ │ 定时30s扫描      │
│                  │ │              │ │ 60s超时关闭      │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

### 分层职责

| 层           | 组件                                                 | 职责                    | 禁止                   |
|-------------|----------------------------------------------------|-----------------------|----------------------|
| **Handler** | ChatWebSocketHandler                               | 连接建立/销毁、入站订阅、出站管道绑定   | 不编写业务逻辑              |
| **Router**  | MessageRouter                                      | 消息解析、类型分发、推送执行、断线清理编排 | 不持有 WebSocketSession |
| **Service** | SessionManager / ChannelService / HeartbeatManager | 状态存储、映射查询、超时检测        | 不处理消息协议              |

---

## 四、核心类设计

### 4.1 WsServerApplication

Spring Boot 入口，`@SpringBootApplication`，默认监听端口 **9000**（可通过 `WS_PORT` 环境变量覆盖）。

### 4.2 WebSocketConfig

将 `/ws/chat` 路径映射到 `ChatWebSocketHandler`，`order = -1` 确保 WebSocket 映射优先于其他 HandlerMapping。

### 4.3 ChatWebSocketHandler

实现 `WebSocketHandler`，管理每个 WebSocket 连接的完整生命周期：

```
连接建立
  │
  ├─→ SessionManager.addSession(session)
  ├─→ MessageRouter.registerSink(session.id)
  │
  ├─→ [并行订阅]
  │     inbound:  session.receive() → MessageRouter.route()
  │     outbound:  Sink.asFlux() → session.textMessage() → session.send()
  │
  └─→ doFinally → MessageRouter.handleDisconnect()
```

### 4.4 MessageRouter（消息路由核心）

```
route(sessionId, rawJson)
  │
  ├─ JSON 解析失败 → sendError("Invalid JSON")
  ├─ InboundType 未知 → sendError("Unknown type")
  │
  └─ 分发到对应 handler:
       ├─ AUTH          → 用户认证、好友上线通知
       ├─ PING          → PONG 回复
       ├─ JOIN_CHANNEL  → 加入频道、广播 USER_JOINED
       ├─ LEAVE_CHANNEL → 离开频道、广播 USER_LEFT
       ├─ CHAT_MESSAGE  → 频道广播 (排除发送方)
       └─ DM_MESSAGE    → 私聊投递 + 回显
```

每个 session 对应一个 `Sinks.Many<String>`（`directBestEffort` 策略，背压时丢弃最早消息），出站消息通过 `tryEmitNext()` 写入
Sink，由 ChatWebSocketHandler 的出站流消费并写入 WebSocket 帧。

**断线清理流程 (handleDisconnect)**：

```
1. 向在线好友广播 FRIEND_OFFLINE
2. ChannelService.leaveAllChannels(sessionId)
3. HeartbeatManager.removeSession(sessionId)
4. removeSink(sessionId)
5. SessionManager.removeSession(sessionId)
```

### 4.5 SessionManager

三层 `ConcurrentHashMap` 内存存储：

| 映射             | Key → Value                  | 用途             |
|----------------|------------------------------|----------------|
| `sessions`     | sessionId → WebSocketSession | 连接与会话的映射       |
| `userSessions` | userId → sessionId           | 用户与连接的映射（私聊路由） |
| `userFriends`  | userId → Set\<friendId\>     | 好友列表（上下线通知）    |

设计要点：

- 同一用户重复连接时旧映射被覆盖（WebSocketSession 会被新连接替换）
- 所有状态为纯内存存储，服务重启后全部丢失
- 好友列表由客户端在 AUTH 消息中主动上报

### 4.6 ChannelService

`channelId → Set<sessionId>` 映射，基于 `ConcurrentHashMap` + `ConcurrentHashMap.newKeySet()`。

- 频道在首次 join 时自动创建
- 频道在最后一个成员离开后自动销毁
- 断线时 `leaveAllChannels` 一次性退出所有频道

### 4.7 HeartbeatManager

基于 `@Scheduled(fixedRate = 30_000)` 的定时心跳检测：

```
定时任务 (每30秒)
  │
  └─ 遍历 lastPing
       ├─ now - lastPing > 60s → 超时连接
       │    └─ session.close(STALE_CLOSE) → 触发 doFinally → cleanup
       └─ now - lastPing ≤ 60s → 正常连接
```

客户端发送 PING，服务端记录时间并回复 PONG。超时关闭码：`4001 "Heartbeat timeout"`。

---

## 五、消息协议

### 5.1 入站消息（客户端 → 服务端）

| 类型              | Payload                                   | 说明            |
|-----------------|-------------------------------------------|---------------|
| `AUTH`          | `{ userId: Long, friendIds?: [Long] }`    | 绑定用户身份，上报好友列表 |
| `PING`          | `null` 或任意                                | 心跳保活          |
| `JOIN_CHANNEL`  | `{ channelId: Long }`                     | 加入频道          |
| `LEAVE_CHANNEL` | `{ channelId: Long }`                     | 离开频道          |
| `CHAT_MESSAGE`  | `{ channelId: Long, content: String }`    | 发送频道消息        |
| `DM_MESSAGE`    | `{ targetUserId: Long, content: String }` | 发送私聊消息        |

### 5.2 出站消息（服务端 → 客户端）

| 类型               | Payload                                              | 说明             |
|------------------|------------------------------------------------------|----------------|
| `PONG`           | ISO-8601 时间戳字符串                                      | 心跳响应           |
| `CHAT_MESSAGE`   | `{ channelId, senderSessionId, content, timestamp }` | 频道消息广播         |
| `DM_MESSAGE`     | `{ senderSessionId, content, timestamp }`            | 私聊消息           |
| `USER_JOINED`    | `{ sessionId, channelId, onlineCount }`              | 用户加入频道通知       |
| `USER_LEFT`      | `{ sessionId, channelId, onlineCount }`              | 用户离开频道通知       |
| `FRIEND_ONLINE`  | `{ userId, timestamp }`                              | 好友上线通知         |
| `FRIEND_OFFLINE` | `{ userId, timestamp }`                              | 好友下线通知         |
| `ONLINE_FRIENDS` | `{ onlineFriendIds: [Long] }`                        | AUTH 后返回当前在线好友 |
| `ERROR`          | 错误描述字符串                                              | 错误提示           |

### 5.3 消息格式

```json
// 入站
{
  "type": "AUTH",
  "payload": {
    "userId": 1001,
    "friendIds": [
      1002,
      1003
    ]
  }
}

// 出站
{
  "type": "CHAT_MESSAGE",
  "payload": {
    "channelId": 1,
    "senderSessionId": "abc123",
    "content": "Hello",
    "timestamp": "2026-05-18T10:30:00Z"
  }
}
```

---

## 六、通信流程

### 6.1 连接建立与认证

```
Client                                ws-server
  │                                       │
  │──── WebSocket connect /ws/chat ──────→│
  │                                       │  SessionManager.addSession()
  │                                       │  MessageRouter.registerSink()
  │                                       │  HeartbeatManager.recordHeartbeat()
  │                                       │
  │──── { type: "AUTH", payload: {...} }─→│
  │                                       │  SessionManager.bindUser(sessionId, userId)
  │                                       │  SessionManager.setFriends(userId, friendIds)
  │                                       │  广播 FRIEND_ONLINE 给在线好友
  │←─── { type: "ONLINE_FRIENDS", ... }───│  返回当前在线好友列表
```

### 6.2 频道消息

```
Client A                               ws-server                              Client B, C
  │                                       │                                       │
  │── { type:"CHAT_MESSAGE",             │                                       │
  │     payload:{channelId:1,content}}──→│                                       │
  │                                       │  broadcastToChannel(1, msg,         │
  │                                       │    excludeSession=A)                 │
  │                                       │──────────────── { type:"CHAT_       │
  │                                       │                 MESSAGE", ... }────→│ B, C
```

### 6.3 私聊消息

```
Client A                               ws-server                              Client B
  │                                       │                                       │
  │── { type:"DM_MESSAGE",               │                                       │
  │     payload:{targetUserId:B,         │                                       │
  │              content:"hi"}}──────────→│                                       │
  │                                       │  sessionManager.getSessionByUser(B)  │
  │                                       │──── { type:"DM_MESSAGE", ... }──────→│ B (在线时)
  │←── { type:"DM_MESSAGE", ... }────────│  (回显给发送方)                       │
```

### 6.4 心跳

```
Client                                ws-server
  │                                       │
  │──── { type: "PING" } ────────────────→│  HeartbeatManager.recordHeartbeat()
  │←─── { type: "PONG", payload: "..." }──│
  │                                       │
  │         ... 每 N 秒重复 ...           │
  │                                       │
  │         (60s 无 PING)                 │  HeartbeatManager 检测超时
  │←─── Close(4001, "Heartbeat timeout")──│  主动关闭连接
```

---

## 七、数据模型

### 7.1 内存数据结构

所有状态均为内存存储，使用 `ConcurrentHashMap` 保证线程安全：

```
sessions:      Map<sessionId: String,  WebSocketSession>
userSessions:  Map<userId: Long,       sessionId: String>
userFriends:   Map<userId: Long,       Set<friendId: Long>>
channels:      Map<channelId: Long,    Set<sessionId: String>>
lastPing:      Map<sessionId: String,  lastPingTime: Long>
sinks:         Map<sessionId: String,  Sinks.Many<String>>
```

### 7.2 持久化数据（外部服务）

ws-server 自身不持久化数据。聊天消息落库、聊天室配置等通过以下方式实现：

| 数据     | 存储位置                              | 说明                            |
|--------|-----------------------------------|-------------------------------|
| 聊天室列表  | PostgreSQL `chat_room` 表          | 管理员预设，由 REST API 提供           |
| 历史消息   | PostgreSQL `chat_message` 表       | 由 REST API 写入，ws-server 不直接操作 |
| 在线用户   | Redis `chat:room:online:{roomId}` | 后续集成                          |
| 用户在线状态 | Redis `chat:user:online:{userId}` | 后续集成                          |

---

## 八、配置说明

```yaml
# application.yml
server.port: ${WS_PORT:9000}          # 服务端口，默认 9000
logging.level.com.linksee.ws: DEBUG   # 业务日志级别
management.endpoints.web.exposure.include: health,metrics,info
```

### 依赖项

```kotlin
// build.gradle.kts
spring - boot - starter - webflux          // WebFlux + Reactive WebSocket
jackson - module - kotlin                 // JSON 序列化
reactor - kotlin - extensions             // Reactor Kotlin 扩展
kotlinx - coroutines - reactor            // 协程与 Reactor 互操作
spring - boot - starter - actuator          // 健康检查与监控
```

---

## 九、与 PROJECT.md 的差异说明

PROJECT.md 中描述的 ws-server 技术栈为 "Socket.IO + Kotlin/Netty WebSocket"，当前实现存在以下差异：

| 维度   | PROJECT.md 描述                                                              | 当前实现                                                                            | 影响                |
|------|----------------------------------------------------------------------------|---------------------------------------------------------------------------------|-------------------|
| 传输协议 | Socket.IO (带自动重连/房间/命名空间)                                                  | 纯 WebSocket (RFC 6455)                                                          | 前端需自行处理重连、房间逻辑    |
| 网络框架 | Netty (netty-socketio)                                                     | Spring WebFlux Reactive WebSocket                                               | 非 Netty 原生，并发模型不同 |
| 端口   | 9000                                                                       | 9000                                                                            | 一致                |
| 连接路径 | `/ws`                                                                      | `/ws/chat`                                                                      | 路径有差异             |
| 消息协议 | Socket.IO 事件 (`auth`, `join_room`, `room_msg`, `dm_msg`, `typing`, `ping`) | JSON `type` 字段分发 (`AUTH`, `JOIN_CHANNEL`, `CHAT_MESSAGE`, `DM_MESSAGE`, `PING`) | 协议不兼容，需统一         |
| 在线状态 | Redis 存储                                                                   | 纯内存存储                                                                           | 不支持多实例部署          |
| 消息落库 | REST API 回调写入                                                              | 未实现                                                                             | 消息不持久化            |
| 输入状态 | 支持 `typing` 事件                                                             | 未实现                                                                             | —                 |

---

## 十、待演进事项

1. **协议对齐**：升级为 Socket.IO 协议或统一为当前纯 WebSocket 方案，与前端协调一致
2. **消息落库**：实现消息持久化，通过 REST 或 MQ 异步写入 `chat_message` 表
3. **水平扩展**：引入 Redis Pub/Sub 作为跨实例消息总线，支持多 ws-server 实例部署
4. **在线状态外置**：将用户在线状态迁移至 Redis，支持网关层查询在线用户
5. **输入状态**：补充 `typing` 事件支持
6. **认证增强**：接入 JWT 校验，而非信任客户端上报的 userId
7. **消息确认**：增加消息 ACK 机制，保证投递可靠性

---

> **文档版本**: v1.0
> **最后更新**: 2026-05-18
> **基于代码版本**: `master` 分支当前状态
