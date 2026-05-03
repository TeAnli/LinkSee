plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.boot)
}

dependencies {
    implementation(project(":linksee-common"))
    implementation(libs.spring.cloud.starter.gateway)
    implementation(libs.spring.boot.starter.data.redis)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.jjwt.api)
}
