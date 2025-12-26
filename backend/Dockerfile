FROM python:3.11-slim

WORKDIR /app

# requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar
COPY . .

# Cloud Run
ENV PORT=8000

# Comando de inicio
CMD uvicorn main:app --host 0.0.0.0 --port $PORT