# ============================================================
# LinkSee WebSocket Server — Kotlin/Spring Boot Dockerfile
# ============================================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Gradle wrapper and build scripts (layer caching)
COPY ws-server/gradlew ws-server/gradlew.bat ./
COPY ws-server/gradle/ gradle/
COPY ws-server/build.gradle.kts ws-server/settings.gradle.kts ./

# Download dependencies (cache this layer)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# Copy source and build
COPY ws-server/ ./
RUN ./gradlew bootJar --no-daemon -x test

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S linksee && adduser -S linksee -G linksee

COPY --from=builder /build/build/libs/*.jar app.jar

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:9000/actuator/health || exit 1

USER linksee

ENTRYPOINT ["java", "-XX:+UseZGC", "-jar", "app.jar"]
