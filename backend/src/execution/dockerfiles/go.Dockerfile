FROM golang:1.22-alpine
WORKDIR /app
RUN adduser -D -u 8888 sandbox
USER sandbox
CMD ["go", "run", "/app/main.go"]
