# EchoForge Voice Cloner

Clonagem de voz com Google Cloud TTS (Chirp 3 HD).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Python 3.12, FastAPI |
| TTS | Google Cloud TTS v1beta1 (Chirp 3) |
| Deploy | Google Cloud Run |

## Estrutura

```
voice-cloner/
├── components/      # Componentes React
├── services/        # Cliente API
├── backend/         # FastAPI + GCP TTS
└── docs/            # Planos e documentacao
```

## Comandos

```bash
# Frontend
bun install && bun run dev

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

## Documentacao

| Arquivo | Conteudo |
|---------|----------|
| `CLAUDE.md` | Regras operacionais para Claude Code |
| `backend/CLAUDE.md` | Regras especificas do backend |

## Git

**OBRIGATORIO:**

1. **Branch para alteracoes significativas** — >3 arquivos OU mudanca estrutural = criar branch
2. **Pull antes de trabalhar** — `git pull origin main`
3. **Commit ao finalizar** — Nunca deixar trabalho nao commitado
4. **Deletar branch apos merge** — Local e remota

## Erros Conhecidos

| Data | Erro | Solucao |
|------|------|---------|
| - | - | - |

## Links

- [Chirp 3 Docs](https://cloud.google.com/text-to-speech/docs/voice-clone)
- Backend prod: https://voice-cloner-api-105426697046.us-west1.run.app
