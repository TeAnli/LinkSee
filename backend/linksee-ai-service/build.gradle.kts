plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.jimmer)
}

dependencies {
    implementation(project(":linksee-common"))
    implementation(project(":linksee-feign-clients"))

    // Jimmer ORM
    implementation(libs.jimmer.spring.boot.starter)
    kapt(libs.jimmer.spring.boot.starter)

    // Spring Boot
    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.webflux)
    implementation(libs.spring.boot.starter.data.redis)
    implementation(libs.spring.boot.starter.amqp)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.configuration.processor)

    // Elasticsearch
    implementation(libs.spring.boot.starter.data.elasticsearch)

    // Coroutines (for SSE streaming)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.reactor)

    // Database
    runtimeOnly(libs.postgresql)

    // Test
    testImplementation(libs.spring.boot.starter.test)
}
