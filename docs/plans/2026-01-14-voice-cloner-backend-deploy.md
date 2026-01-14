# Voice Cloner Backend - Implementation & Deploy Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Completar o backend de clonagem de voz e fazer deploy no Google Cloud Run.

**Architecture:** FastAPI backend stateless que recebe audio de referencia + audio de consentimento + texto, chama Google Cloud TTS v1beta1 (Instant Custom Voice com chirp-3-hd), e retorna audio MP3 sintetizado.

**Tech Stack:** Python 3.12, FastAPI, google-cloud-texttospeech (v1beta1), uvicorn, Docker, Google Cloud Run

---

<session-context>
## Contexto da Sessao Anterior

### O que foi feito:
1. Backend criado em `/home/cmr-auto/claude-work/repos/voice-cloner/backend/`
2. Arquivos criados:
   - `main.py` - FastAPI com 3 endpoints
   - `services/gcp_tts.py` - Servico GCP TTS v1beta1
   - `requirements.txt` - Dependencias
   - `Dockerfile` - Pronto para Cloud Run
   - `.env.example`

### Descoberta Critica:
A API do Google exige **consent_audio** - o usuario deve gravar a si mesmo dizendo:
> "I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model."

Isso e **obrigatorio** por questoes eticas/legais.

### Endpoints Implementados:
| Endpoint | Metodo | Funcao |
|----------|--------|--------|
| `/health` | GET | Health check |
| `/consent-script` | GET | Retorna script de consentimento |
| `/api/clone-voice` | POST | Clona voz (multipart/form-data) |

### Fluxo da API:
```
POST /api/clone-voice
  - reference_audio: UploadFile (voz a clonar)
  - consent_audio: UploadFile (usuario consentindo)
  - text: str (texto a sintetizar)
  - language_code: str (default: pt-BR)
```
</session-context>

---

## Pre-Requisitos

<prerequisites>
### Google Cloud
- [ ] Projeto GCP existente
- [ ] Cloud Text-to-Speech API habilitada
- [ ] Service Account com permissoes TTS
- [ ] gcloud CLI autenticado

### Local
- [ ] Python 3.12+
- [ ] Docker instalado
- [ ] Arquivos de teste (audio MP3)
</prerequisites>

---

## Task 1: Validar Estrutura do Backend

**Files:**
- Check: `backend/main.py`
- Check: `backend/services/gcp_tts.py`
- Check: `backend/requirements.txt`
- Check: `backend/Dockerfile`

**Step 1: Verificar arquivos existentes**

```bash
cd /home/cmr-auto/claude-work/repos/voice-cloner/backend
ls -la
ls -la services/
```

Expected: Todos os arquivos presentes.

**Step 2: Criar __init__.py se ausente**

```bash
touch services/__init__.py
```

**Step 3: Verificar Dockerfile**

```bash
cat Dockerfile
```

Expected: Dockerfile com Python 3.12 + uvicorn + porta 8080.

---

## Task 2: Criar Dockerfile (se nao existir)

**Files:**
- Create: `backend/Dockerfile`

**Step 1: Criar Dockerfile otimizado**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar codigo
COPY . .

# Porta padrao Cloud Run
EXPOSE 8080

# Comando de inicializacao
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Step 2: Commit**

```bash
git add Dockerfile
git commit -m "feat(backend): add Dockerfile for Cloud Run"
```

---

## Task 3: Testar Localmente

**Files:**
- Run: `backend/main.py`

**Step 1: Criar venv e instalar deps**

```bash
cd /home/cmr-auto/claude-work/repos/voice-cloner/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Step 2: Configurar credenciais GCP**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
# OU se usando ADC:
gcloud auth application-default login
```

**Step 3: Rodar servidor local**

```bash
uvicorn main:app --reload --port 8080
```

Expected: Servidor rodando em http://localhost:8080

**Step 4: Testar health endpoint**

```bash
curl http://localhost:8080/health
```

Expected: `{"status": "healthy", "service": "voice-cloner-api"}`

**Step 5: Testar consent-script endpoint**

```bash
curl http://localhost:8080/consent-script
```

Expected: JSON com script de consentimento.

---

## Task 4: Deploy no Cloud Run

**Files:**
- Deploy: `backend/`

**Step 1: Navegar para o backend**

```bash
cd /home/cmr-auto/claude-work/repos/voice-cloner/backend
```

**Step 2: Habilitar APIs necessarias**

```bash
gcloud services enable texttospeech.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

**Step 3: Deploy**

```bash
gcloud run deploy voice-cloner-api \
  --source . \
  --region us-west1 \
  --project YOUR_PROJECT_ID \
  --allow-unauthenticated
```

Expected: Deploy bem-sucedido, URL retornada.

**Step 4: Testar endpoint deployado**

```bash
curl https://voice-cloner-api-XXXXX.run.app/health
```

Expected: `{"status": "healthy"}`

---

## Task 5: Atualizar Frontend (Opcional)

<frontend-changes>
### Mudancas Necessarias no Frontend

O frontend atual (`voiceService.ts`) e MOCK. Para integrar com o backend real:

1. **Adicionar campo de consent_audio** na UI
2. **Mostrar script de consentimento** para o usuario gravar
3. **Enviar ambos os audios** no POST

### Fluxo de UX Proposto:
1. Usuario ve o script de consentimento
2. Usuario grava consent_audio (falando o script)
3. Usuario grava/faz upload do reference_audio
4. Usuario digita o texto
5. Frontend envia para `/api/clone-voice`
6. Recebe MP3 e reproduz
</frontend-changes>

---

## Task 6: Teste E2E

**Step 1: Preparar arquivos de teste**

- `reference.mp3` - Audio com a voz de referencia (10-30s)
- `consent.mp3` - Audio com o usuario falando o script de consentimento

**Step 2: Testar via curl**

```bash
curl -X POST https://voice-cloner-api-XXXXX.run.app/api/clone-voice \
  -F "reference_audio=@reference.mp3" \
  -F "consent_audio=@consent.mp3" \
  -F "text=Ola, este e um teste de clonagem de voz." \
  -F "language_code=pt-BR" \
  --output cloned_output.mp3
```

Expected: Arquivo `cloned_output.mp3` com voz clonada.

---

## Troubleshooting

<troubleshooting>
### Erro: "GEMINI_API_KEY not found"
- Nao e necessario para TTS. Usar ADC ou Service Account.

### Erro: 403 Permission Denied
- Verificar se Cloud TTS API esta habilitada
- Verificar permissoes da Service Account

### Erro: "voice_cloning_key not returned"
- Consent audio nao e valido
- Formato de audio nao suportado (usar LINEAR16, MP3, M4A)

### Erro: "Invalid audio content"
- Audio muito curto (minimo 10s recomendado)
- Audio muito longo (maximo 5MB)
</troubleshooting>

---

## Referencias

- [Chirp 3 Instant Custom Voice](https://docs.cloud.google.com/text-to-speech/docs/chirp3-instant-custom-voice)
- [Cloud Run Deploy](https://cloud.google.com/run/docs/deploying-source-code)
- [Python TTS Client](https://docs.cloud.google.com/python/docs/reference/texttospeech/latest)

---

<next-session>
## Proxima Sessao

Para continuar:
1. Ler este plano
2. Verificar qual Task esta pendente
3. Usar `cloud-run-deployer` subagent para deploy
4. Testar E2E com audios reais
</next-session>
