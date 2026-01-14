# Dockerfile para Cloud Run
# Voice Cloner API - FastAPI + Google Cloud TTS

FROM python:3.11-slim

# Evitar prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Diretorio de trabalho
WORKDIR /app

# Copiar requirements primeiro (cache de layers)
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar codigo da aplicacao
COPY . .

# Porta padrao do Cloud Run
ENV PORT=8080

# Expor porta
EXPOSE 8080

# Comando de inicializacao
# Cloud Run injeta $PORT automaticamente
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
