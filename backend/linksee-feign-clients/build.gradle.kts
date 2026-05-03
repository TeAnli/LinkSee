plugins {
    kotlin("jvm")
}

dependencies {
    implementation(project(":linksee-common"))
    implementation(libs.spring.cloud.starter.openfeign)
}
