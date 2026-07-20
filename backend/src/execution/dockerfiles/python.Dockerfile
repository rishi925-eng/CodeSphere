FROM python:3.12-slim
WORKDIR /app
RUN useradd -u 8888 sandbox
USER sandbox
CMD ["python3", "/app/main.py"]
