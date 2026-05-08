plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
}

dependencies {
    implementation(project(":linksee-common"))
    implementation(libs.spring.cloud.starter.openfeign)
}
