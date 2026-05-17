package com.linksee.ws

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * LinkSee WebSocket 聊天微服务启动入口。
 *
 * 基于 [Spring WebFlux](https://docs.spring.io/spring-framework/reference/web/webflux.html)
 * 实现响应式 WebSocket 通信，提供频道消息、私聊、好友在线通知等功能。
 *
 * 默认监听端口 **9000**，可通过 `WS_PORT` 环境变量覆盖。
 */
@SpringBootApplication
class WsServerApplication

fun main(args: Array<String>) {
    runApplication<WsServerApplication>(*args)
}
