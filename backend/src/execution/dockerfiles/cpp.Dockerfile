FROM gcc:14
WORKDIR /app
RUN useradd -u 8888 sandbox
USER sandbox
CMD ["g++", "-O3", "-o", "/app/main", "/app/main.cpp", "&&", "/app/main"]
