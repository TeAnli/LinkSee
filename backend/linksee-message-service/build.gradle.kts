plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("com.google.devtools.ksp")
    id("org.springframework.boot")
}

dependencies {
    implementation(project(":linksee-common"))
    implementation(project(":linksee-feign-clients"))

    implementation(libs.jimmer.spring.boot.starter)
    ksp(libs.jimmer.ksp)

    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.data.redis)
    implementation(libs.spring.boot.starter.amqp)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.configuration.processor)

    implementation(libs.spring.cloud.starter.alibaba.nacos.discovery)

    runtimeOnly(libs.postgresql)

    testImplementation(libs.spring.boot.starter.test)
}
