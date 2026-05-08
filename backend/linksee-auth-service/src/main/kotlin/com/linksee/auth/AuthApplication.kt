package com.linksee.auth

import org.babyfish.jimmer.client.EnableImplicitApi
import org.babyfish.jimmer.sql.spring.boot.JimmerScan
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableImplicitApi
class AuthApplication

fun main(args: Array<String>) {
    runApplication<AuthApplication>(*args)
}