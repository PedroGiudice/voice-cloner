# EchoForge Voice Cloner

Clonagem de voz com Google Cloud TTS (Chirp 3 HD).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19.2, TypeScript 5.8, Vite 6.2, Tailwind CSS |
| Backend | Python 3.12, FastAPI 0.115, uvicorn |
| TTS | Google Cloud TTS v1beta1 (Chirp 3) |
| Deploy | Google Cloud Run |

## Estrutura

```
voice-cloner/
|-- components/          # 6 componentes React
|-- services/            # Cliente API (voiceService.ts)
|-- backend/             # FastAPI + GCP TTS
|-- docs/                # Planos e documentacao
|-- .claude/             # Infraestrutura Claude Code
|   |-- agents/          # 20 subagentes especializados
|   |-- skills/          # 22 skills de dominio/qualidade
|   |-- hooks/           # Automacao de sessao
|   |-- commands/        # Comandos customizados
|   +-- output-styles/   # Estilos de output
+-- ADK-Agents/          # Agentes Google ADK (experimental)
```

## Comandos

```bash
# Frontend (OBRIGATORIO usar bun)
bun install && bun run dev

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

## Subagentes Disponiveis (.claude/agents/)

| Subagente | Funcao | Relevancia |
|-----------|--------|------------|
| `frontend-developer` | Desenvolvimento React/TypeScript | ALTA |
| `frontend-auditor` | Auditoria de componentes | ALTA |
| `backend-developer` | Desenvolvimento Python/FastAPI | ALTA |
| `backend-auditor` | Auditoria de codigo Python | ALTA |
| `cloud-run-deployer` | Deploy para Google Cloud Run | ALTA |
| `test-writer-fixer` | Testes automatizados | MEDIA |
| `tdd-coach` | Test-driven development | MEDIA |
| `code-refactor-master` | Refatoracao de codigo | MEDIA |
| `devops-automator` | CI/CD e Docker | MEDIA |
| `documentation-architect` | Documentacao tecnica | MEDIA |
| `gemini-assistant` | Auditoria com Gemini (arquivos grandes) | MEDIA |
| `ai-engineer` | Sistemas LLM/RAG | BAIXA |
| `web-research-specialist` | Pesquisa web | BAIXA |

## Skills Disponiveis (.claude/skills/)

| Skill | Tipo | Funcao |
|-------|------|--------|
| `deploy` | Domain | Procedimentos de deploy |
| `systematic-debugging` | Quality | Debug metodico |
| `verification-before-completion` | Quality | Validacao de entregas |
| `test-driven-development` | Quality | TDD workflow |
| `brainstorming` | Quality | Planejamento |
| `writing-plans` | Quality | Escrita de planos |
| `gemini-cli` | Tool | Integracao Gemini CLI |
| `route-tester` | Tool | Teste de rotas |
| `visual-dev-workflow` | Tool | Desenvolvimento visual |

## Documentacao

| Arquivo | Conteudo |
|---------|----------|
| `CLAUDE.md` | Regras operacionais para Claude Code |
| `.claude/SUBAGENTS.md` | Documentacao de subagentes |
| `.claude/PERMISSION-HOOKS.md` | Sistema de permissoes |

## Endpoints do Backend

| Endpoint | Metodo | Funcao |
|----------|--------|--------|
| `/health` | GET | Health check |
| `/consent-script` | GET | Script de consentimento |
| `/api/clone-voice` | POST | Clona voz (multipart/form-data) |

## URLs de Producao

- **Backend:** https://voice-cloner-api-105426697046.us-west1.run.app
- **Frontend:** Dev server local (Vite)

## Git

**OBRIGATORIO:**

1. **Branch para alteracoes significativas** - >3 arquivos OU mudanca estrutural = criar branch
2. **Pull antes de trabalhar** - `git pull origin main`
3. **Commit ao finalizar** - Nunca deixar trabalho nao commitado
4. **Deletar branch apos merge** - Local e remota

## Links

- [Chirp 3 Docs](https://cloud.google.com/text-to-speech/docs/voice-clone)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React 19 Docs](https://react.dev/)
