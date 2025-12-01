## Multi-stage Dockerfile for Spring Boot (Gradle) app
# 1) Build stage
FROM gradle:8.10.2-jdk21-alpine AS builder
WORKDIR /app

# Leverage Gradle cache
COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY src src
COPY gradlew gradlew

RUN chmod +x gradlew \
  && ./gradlew --no-daemon clean bootJar

# 2) Run stage
FROM eclipse-temurin:21-jre-alpine
ENV JAVA_OPTS=""
WORKDIR /opt/app

# Create non-root user
RUN addgroup -S spring \
  && adduser -S spring -G spring

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
USER spring
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /opt/app/app.jar"]
