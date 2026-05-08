plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("org.springframework.boot")
}

dependencies {
    implementation(project(":linksee-common"))
//    implementation(libs.spring.cloud.starter.gateway)
    implementation(libs.spring.boot.starter.data.redis)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.sa.token.reactor)
    implementation(libs.spring.cloud.starter.alibaba.nacos.discovery)
    implementation(libs.spring.cloud.starter.alibaba.nacos.config)
    implementation(libs.spring.cloud.starter.alibaba.sentinel)
    implementation(libs.spring.cloud.alibaba.sentinel.gateway)
}
