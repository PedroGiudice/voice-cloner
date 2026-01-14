# CLAUDE.md

Instrucoes operacionais para Claude Code neste repositorio.

**Projeto:** EchoForge Voice Cloner
**Stack:** React 19 + TypeScript (frontend) | FastAPI + Python 3.12 (backend)
**Deploy:** Google Cloud Run

---

## Regras Criticas

### 1. Bun OBRIGATORIO (nunca npm/yarn/node)
```bash
bun install && bun run dev && bun run build
```

**Para scripts JS:** Sempre `bun run script.js`, nunca `node script.js`

### 2. Ambiente Virtual Obrigatorio (Backend)
```bash
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Nunca Commitar
- `.venv/`, `__pycache__/`, `node_modules/`
- `*.mp3`, `*.wav`, `*.webm` (arquivos de audio de teste)
- `.env` (credenciais)

### 4. ZERO Emojis
**PROIBIDO** usar emojis em qualquer output: respostas, codigo, commits, comentarios.
Motivo: Bug no CLI Rust causa crash em char boundaries de emojis (4 bytes).

### 5. Separacao Frontend/Backend
- Ao trabalhar no frontend, NAO modifique arquivos em `backend/`
- Ao trabalhar no backend, NAO modifique arquivos `.tsx`, `.ts` (exceto types compartilhados)

---

## Arquitetura

```
voice-cloner/
|-- App.tsx                # Componente principal React
|-- index.tsx              # Entry point
|-- types.ts               # Tipos TypeScript compartilhados
|-- components/            # Componentes React
|   |-- ReferenceAudioInput.tsx
|   |-- ConsentAudioInput.tsx
|   |-- TargetTextInput.tsx
|   |-- VoiceControls.tsx
|   +-- ActionPanel.tsx
|-- services/
|   +-- voiceService.ts    # Cliente API para backend
|-- backend/               # FastAPI backend
|   |-- main.py            # Endpoints FastAPI
|   |-- services/
|   |   +-- gcp_tts.py     # Servico Google Cloud TTS
|   |-- Dockerfile
|   +-- requirements.txt
+-- docs/                  # Documentacao e planos
```

---

## Endpoints do Backend

| Endpoint | Metodo | Funcao |
|----------|--------|--------|
| `/health` | GET | Health check |
| `/consent-script` | GET | Script de consentimento |
| `/api/clone-voice` | POST | Clona voz (multipart/form-data) |

---

## Fluxo de Clonagem

```
1. Usuario faz upload do audio de referencia (voz a clonar)
2. Usuario grava audio de consentimento (falando script obrigatorio)
3. Usuario digita texto a ser sintetizado
4. Frontend envia para /api/clone-voice
5. Backend gera voice_cloning_key via REST API v1beta1
6. Backend sintetiza audio via Python SDK
7. Retorna MP3 para o frontend
```

---

## Comandos

### Frontend
```bash
bun install              # Instalar dependencias
bun run dev              # Rodar dev server (Vite)
bun run build            # Build producao
```

### Backend
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8080
```

### Deploy (Cloud Run)
```bash
cd backend
gcloud run deploy voice-cloner-api \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

---

## Erros Aprendidos

| Data | Erro | Regra |
|------|------|-------|
| - | - | - |

---

## URL de Producao

- **Backend:** https://voice-cloner-api-105426697046.us-west1.run.app
- **Frontend:** AI Studio (Vite dev server local)

---

## Requisitos Google Cloud

1. Cloud Text-to-Speech API habilitada
2. Cloud Run API habilitada
3. ADC configurado (`gcloud auth application-default login`)

---

## NUNCA

- Usar npm/yarn/node
- Commitar audios de teste
- Modificar frontend ao trabalhar no backend (e vice-versa)
- Usar emojis
- Ignorar o audio de consentimento (obrigatorio pela API Google)
