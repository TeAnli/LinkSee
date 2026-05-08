package com.linksee.message

import org.babyfish.jimmer.client.EnableImplicitApi
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableImplicitApi
class MessageApplication

fun main(args: Array<String>) {
    runApplication<MessageApplication>(*args)
}