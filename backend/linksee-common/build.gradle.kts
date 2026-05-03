plugins {
    kotlin("jvm")
}

dependencies {
    implementation(libs.jimmer.sql.kotlin)
    implementation(libs.commons.lang3)
    implementation(libs.commons.codec)
    implementation(libs.jjwt.api)
    implementation(libs.jjwt.jackson)
    implementation(libs.jackson.module.kotlin)
}
