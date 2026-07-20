FROM node:20-slim
WORKDIR /app
RUN npm install -g tsx
USER node
CMD ["tsx", "/app/main.ts"]
