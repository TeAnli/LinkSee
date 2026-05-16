package com.linksee.ws

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class WsServerApplication

fun main(args: Array<String>) {
    runApplication<WsServerApplication>(*args)
}
