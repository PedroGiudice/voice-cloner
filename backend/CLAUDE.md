# CLAUDE.md - Voice Cloner Backend

Backend FastAPI para clonagem de voz usando Google Cloud TTS v1beta1.

---

## Arquitetura

```
backend/
|-- main.py                # FastAPI app + endpoints
|-- services/
|   |-- __init__.py
|   +-- gcp_tts.py         # Servico Google Cloud TTS
|-- Dockerfile             # Deploy Cloud Run
|-- requirements.txt       # Dependencias Python
+-- .env.example           # Template de variaveis
```

---

## Stack

- Python 3.12+
- FastAPI + uvicorn
- google-cloud-texttospeech (v1beta1)
- Autenticacao: ADC (Application Default Credentials)

---

## Endpoints

### GET /health
Health check para Cloud Run.

### GET /consent-script
Retorna script de consentimento obrigatorio.

### POST /api/clone-voice
Clona voz a partir de audio de referencia.

**Parametros (multipart/form-data):**
- `reference_audio`: Audio da voz a clonar (max 5MB)
- `consent_audio`: Audio do usuario consentindo (max 5MB)
- `text`: Texto a sintetizar (max 5000 chars)
- `language_code`: Idioma (default: pt-BR)

**Retorno:** audio/mp3

---

## Fluxo Interno

```
1. Valida inputs (tamanho, formato)
2. Chama generate_voice_cloning_key() via REST API
   - Envia reference_audio + consent_audio
   - Recebe voice_cloning_key
3. Chama synthesize_with_voice_clone() via Python SDK
   - Usa voice_cloning_key + texto
   - Recebe audio MP3
4. Retorna MP3 ao cliente
```

---

## Comandos

```bash
# Setup
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Rodar local
uvicorn main:app --reload --port 8080

# Testar health
curl http://localhost:8080/health

# Deploy Cloud Run
gcloud run deploy voice-cloner-api \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

---

## Sobre o Consent Audio

**OBRIGATORIO pela API do Google.**

O usuario deve gravar a si mesmo dizendo:
> "I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model."

Sem este audio, a API retorna erro.

---

## Erros Comuns

| Erro | Causa | Solucao |
|------|-------|---------|
| 403 Permission Denied | API nao habilitada | `gcloud services enable texttospeech.googleapis.com` |
| voice_cloning_key not returned | Consent invalido | Verificar audio de consentimento |
| Invalid audio content | Audio corrompido | Usar formato MP3/WAV valido |
| Quota excedida | Limite API | Aguardar reset ou aumentar quota |

---

## Limites

- Audio referencia: max 5MB
- Audio consentimento: max 5MB
- Texto: max 5000 caracteres

---

## NUNCA

- Commitar `.env` com credenciais
- Usar sync I/O em endpoints async
- Ignorar validacao de tamanho de arquivos
- Processar audio sem consent_audio

---

*Herdado de: ../CLAUDE.md*
