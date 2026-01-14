"""
Voice Cloner API - FastAPI Backend

Endpoint para clonagem de voz usando Google Cloud TTS v1beta1.

IMPORTANTE: A API do Google exige um audio de consentimento do usuario.
O usuario deve gravar a si mesmo dizendo o script de consentimento.
"""

import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

from services.gcp_tts import get_tts_service, VoiceCloningError

# Carregar variaveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Criar app FastAPI
app = FastAPI(
    title="Voice Cloner API",
    description="API para clonagem de voz usando Google Cloud TTS (Chirp 3)",
    version="1.0.0",
)

# Configurar CORS para permitir frontend separado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em producao, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Limites
MAX_AUDIO_SIZE = 5 * 1024 * 1024  # 5MB
MAX_TEXT_LENGTH = 5000  # caracteres

# Script de consentimento padrao
DEFAULT_CONSENT_SCRIPT = (
    "I am the owner of this voice and I consent to Google using "
    "this voice to create a synthetic voice model."
)


@app.get("/health")
async def health_check():
    """Endpoint de health check para Cloud Run."""
    return {"status": "healthy", "service": "voice-cloner-api"}


@app.get("/consent-script")
async def get_consent_script():
    """Retorna o script de consentimento que o usuario deve gravar."""
    return {
        "script": DEFAULT_CONSENT_SCRIPT,
        "instructions": (
            "Grave voce mesmo falando este texto em voz alta. "
            "Este audio e necessario por questoes legais/eticas do Google."
        ),
    }


@app.post("/api/clone-voice")
async def clone_voice(
    reference_audio: UploadFile = File(
        ...,
        description="Audio de referencia (voz a ser clonada)",
    ),
    consent_audio: UploadFile = File(
        ...,
        description="Audio de consentimento (usuario falando o script)",
    ),
    text: str = Form(
        ...,
        description="Texto a ser convertido em fala",
    ),
    language_code: str = Form(
        default="pt-BR",
        description="Codigo do idioma (ex: pt-BR, en-US)",
    ),
):
    """
    Clona uma voz a partir de audio de referencia.

    **Requisitos:**
    - **reference_audio**: Arquivo de audio com a voz de referencia (max 5MB)
    - **consent_audio**: Arquivo de audio com o usuario falando o script de consentimento
    - **text**: Texto que sera falado com a voz clonada (max 5000 caracteres)
    - **language_code**: Idioma do texto (default: pt-BR)

    **Sobre o consent_audio:**
    O Google exige que o dono da voz grave um audio consentindo com a clonagem.
    Use GET /consent-script para obter o texto que deve ser gravado.

    Retorna o audio sintetizado em formato MP3.
    """
    # Validar tamanho do texto
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Texto excede limite de {MAX_TEXT_LENGTH} caracteres"
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Texto nao pode estar vazio"
        )

    # Ler audios
    try:
        reference_bytes = await reference_audio.read()
        consent_bytes = await consent_audio.read()
    except Exception as e:
        logger.error(f"Erro ao ler arquivos de audio: {e}")
        raise HTTPException(status_code=400, detail="Erro ao ler arquivos de audio")

    # Validar tamanhos
    if len(reference_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Audio de referencia excede limite de {MAX_AUDIO_SIZE // (1024*1024)}MB"
        )

    if len(consent_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Audio de consentimento excede limite de {MAX_AUDIO_SIZE // (1024*1024)}MB"
        )

    if len(reference_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Audio de referencia esta vazio"
        )

    if len(consent_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Audio de consentimento esta vazio"
        )

    logger.info(
        f"Recebido: reference={len(reference_bytes)}B, "
        f"consent={len(consent_bytes)}B, text={len(text)} chars"
    )

    # Chamar servico de TTS
    try:
        tts_service = get_tts_service()
        synthesized_audio = await tts_service.clone_voice_full_flow(
            text=text,
            reference_audio=reference_bytes,
            consent_audio=consent_bytes,
            language_code=language_code,
        )

        return Response(
            content=synthesized_audio,
            media_type="audio/mp3",
            headers={
                "Content-Disposition": "attachment; filename=cloned_voice.mp3"
            }
        )

    except VoiceCloningError as e:
        logger.error(f"Erro na clonagem de voz: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Erro inesperado: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
