plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.spring") version "2.3.21"
    alias(libs.plugins.kotlin.ksp)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

allprojects {
    group = "com.linksee"
    version = "1.0.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}
dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2025.0.0")
        mavenBom("com.alibaba.cloud:spring-cloud-alibaba-dependencies:2025.0.0.0")
    }
}
subprojects {
    apply(plugin = "org.springframework.boot")
    apply(plugin = "org.jetbrains.kotlin.jvm")
    apply(plugin = "org.jetbrains.kotlin.plugin.spring")
    apply(plugin = "io.spring.dependency-management")
    apply(plugin = "com.google.devtools.ksp")
    dependencyManagement {
        imports {
            mavenBom("org.springframework.cloud:spring-cloud-dependencies:2025.0.0")
            mavenBom("com.alibaba.cloud:spring-cloud-alibaba-dependencies:2025.0.0.0")
        }
    }
    dependencies {
        ksp("org.babyfish.jimmer:jimmer-ksp:0.10.7")

        implementation(kotlin("reflect"))
        testImplementation(kotlin("test"))

        implementation("org.jetbrains.kotlin:kotlin-stdlib")
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    }

    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        compilerOptions {
            freeCompilerArgs.addAll("-Xjsr305=strict")
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}
