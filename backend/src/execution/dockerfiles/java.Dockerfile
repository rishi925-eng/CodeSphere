FROM eclipse-temurin:21-jdk
WORKDIR /app
RUN useradd -u 8888 sandbox
USER sandbox
CMD ["javac", "/app/Main.java", "&&", "java", "-cp", "/app", "Main"]
