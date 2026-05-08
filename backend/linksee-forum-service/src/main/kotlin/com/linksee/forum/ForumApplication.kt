package com.linksee.forum

import org.babyfish.jimmer.client.EnableImplicitApi
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableImplicitApi
class ForumApplication

fun main(args: Array<String>) {
    runApplication<ForumApplication>(*args)
}