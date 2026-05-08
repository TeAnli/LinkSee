plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("com.google.devtools.ksp")
}

dependencies {
    implementation(libs.jimmer.sql.kotlin)
    ksp(libs.jimmer.ksp)
    
    implementation(libs.commons.lang3)
    implementation(libs.commons.codec)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.sa.token.core)
    implementation(libs.sa.token.redis.jackson)
    implementation(libs.spring.cloud.starter.alibaba.nacos.discovery)
    implementation(libs.spring.cloud.starter.alibaba.sentinel)
}