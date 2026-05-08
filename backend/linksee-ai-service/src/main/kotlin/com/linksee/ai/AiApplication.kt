package com.linksee.ai

import org.babyfish.jimmer.client.EnableImplicitApi
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableImplicitApi
class AiApplication

fun main(args: Array<String>) {
    runApplication<AiApplication>(*args)
}