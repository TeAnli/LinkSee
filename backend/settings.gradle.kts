rootProject.name = "linksee-backend"

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
        google()
    }
}

include(":linksee-common")
include(":linksee-feign-clients")
include(":linksee-api-gateway")
include(":linksee-auth-service")
include(":linksee-user-service")
include(":linksee-forum-service")
include(":linksee-ai-service")
include(":linksee-message-service")

