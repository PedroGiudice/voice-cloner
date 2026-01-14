"""
Google Cloud Text-to-Speech Service - Instant Custom Voice

Implementa clonagem de voz com Chirp 3 usando:
1. GenerateVoiceCloningKey (REST API v1beta1)
2. SynthesizeSpeech com VoiceCloneParams

REQUISITO IMPORTANTE: A API exige consent_audio (gravacao do usuario
consentindo com o uso da voz). Isso e obrigatorio por questoes eticas/legais.
"""

import os
import base64
import requests
import logging
from typing import Optional
from google.cloud import texttospeech_v1beta1 as texttospeech
from google.auth import default as google_auth_default
from google.auth.transport.requests import Request
from google.api_core import exceptions as gcp_exceptions

logger = logging.getLogger(__name__)


class VoiceCloningError(Exception):
    """Erro durante clonagem de voz."""
    pass


class GCPTextToSpeechService:
    """
    Servico para sintese de voz com clonagem instantanea.

    Usa Google Cloud TTS v1beta1 com Instant Custom Voice.
    """

    GENERATE_KEY_URL = "https://texttospeech.googleapis.com/v1beta1/voices:generateVoiceCloningKey"

    # Script de consentimento padrao (usuario deve gravar isso)
    DEFAULT_CONSENT_SCRIPT = (
        "I am the owner of this voice and I consent to Google using "
        "this voice to create a synthetic voice model."
    )

    def __init__(self, project_id: Optional[str] = None):
        """
        Inicializa servico TTS.

        Args:
            project_id: ID do projeto GCP. Se None, usa ADC.
        """
        try:
            # Cliente TTS para sintese
            self.client = texttospeech.TextToSpeechClient()

            # Credenciais para REST API
            self.credentials, self.project_id = google_auth_default()
            if project_id:
                self.project_id = project_id

            logger.info(f"GCP TTS service inicializado para projeto: {self.project_id}")

        except Exception as e:
            logger.error(f"Falha ao inicializar GCP TTS: {e}")
            raise VoiceCloningError(f"Falha na inicializacao: {e}")

    def _get_access_token(self) -> str:
        """Obtem access token atualizado."""
        if not self.credentials.valid:
            self.credentials.refresh(Request())
        return self.credentials.token

    def _encode_audio_base64(self, audio_bytes: bytes) -> str:
        """Codifica audio em base64."""
        return base64.b64encode(audio_bytes).decode("utf-8")

    async def generate_voice_cloning_key(
        self,
        reference_audio: bytes,
        consent_audio: bytes,
        language_code: str = "pt-BR",
        audio_encoding: str = "MP3",
        consent_script: Optional[str] = None,
    ) -> str:
        """
        Gera chave de clonagem de voz a partir do audio de referencia.

        Args:
            reference_audio: Bytes do audio de referencia (voz a ser clonada).
            consent_audio: Bytes do audio de consentimento (usuario falando o script).
            language_code: Codigo do idioma.
            audio_encoding: Formato do audio (LINEAR16, PCM, MP3, M4A).
            consent_script: Script de consentimento (default: padrao em ingles).

        Returns:
            voice_cloning_key para uso na sintese.

        Raises:
            VoiceCloningError: Se a geracao falhar.
        """
        if consent_script is None:
            consent_script = self.DEFAULT_CONSENT_SCRIPT

        request_body = {
            "reference_audio": {
                "audio_config": {"audio_encoding": audio_encoding},
                "content": self._encode_audio_base64(reference_audio),
            },
            "voice_talent_consent": {
                "audio_config": {"audio_encoding": audio_encoding},
                "content": self._encode_audio_base64(consent_audio),
            },
            "consent_script": consent_script,
            "language_code": language_code,
        }

        headers = {
            "Authorization": f"Bearer {self._get_access_token()}",
            "x-goog-user-project": self.project_id,
            "Content-Type": "application/json; charset=utf-8",
        }

        try:
            logger.info(f"Gerando voice cloning key para {language_code}")
            response = requests.post(
                self.GENERATE_KEY_URL,
                headers=headers,
                json=request_body,
                timeout=60,
            )
            response.raise_for_status()

            response_json = response.json()
            voice_cloning_key = response_json.get("voiceCloningKey")

            if not voice_cloning_key:
                raise VoiceCloningError("API nao retornou voice_cloning_key")

            logger.info("Voice cloning key gerada com sucesso")
            return voice_cloning_key

        except requests.exceptions.HTTPError as e:
            error_detail = e.response.text if e.response else str(e)
            logger.error(f"Erro HTTP na geracao de key: {error_detail}")
            raise VoiceCloningError(f"Erro na API de clonagem: {error_detail}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de request: {e}")
            raise VoiceCloningError(f"Erro de conexao com API: {e}")

    async def synthesize_with_voice_clone(
        self,
        text: str,
        voice_cloning_key: str,
        language_code: str = "pt-BR",
        audio_encoding: texttospeech.AudioEncoding = texttospeech.AudioEncoding.MP3,
        sample_rate_hertz: int = 24000,
    ) -> bytes:
        """
        Sintetiza fala usando voz clonada.

        Args:
            text: Texto a ser convertido em fala.
            voice_cloning_key: Chave gerada por generate_voice_cloning_key.
            language_code: Codigo do idioma.
            audio_encoding: Formato de saida.
            sample_rate_hertz: Taxa de amostragem.

        Returns:
            Bytes do audio sintetizado.

        Raises:
            VoiceCloningError: Se a sintese falhar.
        """
        try:
            voice_clone_params = texttospeech.VoiceCloneParams(
                voice_cloning_key=voice_cloning_key
            )

            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                voice_clone=voice_clone_params,
            )

            request = texttospeech.SynthesizeSpeechRequest(
                input=texttospeech.SynthesisInput(text=text),
                voice=voice,
                audio_config=texttospeech.AudioConfig(
                    audio_encoding=audio_encoding,
                    sample_rate_hertz=sample_rate_hertz,
                ),
            )

            logger.info(f"Sintetizando {len(text)} caracteres com voz clonada")
            response = self.client.synthesize_speech(request=request)

            logger.info(f"Sintese concluida: {len(response.audio_content)} bytes")
            return response.audio_content

        except gcp_exceptions.InvalidArgument as e:
            logger.error(f"Argumento invalido: {e}")
            raise VoiceCloningError(f"Parametros invalidos: {e}")
        except gcp_exceptions.PermissionDenied as e:
            logger.error(f"Permissao negada: {e}")
            raise VoiceCloningError("Permissao negada. Verifique credenciais GCP.")
        except gcp_exceptions.ResourceExhausted as e:
            logger.error(f"Quota excedida: {e}")
            raise VoiceCloningError("Quota da API excedida.")
        except Exception as e:
            logger.error(f"Erro inesperado na sintese: {e}")
            raise VoiceCloningError(f"Erro na sintese: {e}")

    async def clone_voice_full_flow(
        self,
        text: str,
        reference_audio: bytes,
        consent_audio: bytes,
        language_code: str = "pt-BR",
    ) -> bytes:
        """
        Fluxo completo: gera key + sintetiza.

        Conveniencia para fazer ambas operacoes em uma chamada.

        Args:
            text: Texto a ser falado.
            reference_audio: Audio de referencia (voz a clonar).
            consent_audio: Audio de consentimento.
            language_code: Idioma.

        Returns:
            Bytes do audio sintetizado com a voz clonada.
        """
        # 1. Gerar chave de clonagem
        voice_cloning_key = await self.generate_voice_cloning_key(
            reference_audio=reference_audio,
            consent_audio=consent_audio,
            language_code=language_code,
        )

        # 2. Sintetizar com a voz clonada
        return await self.synthesize_with_voice_clone(
            text=text,
            voice_cloning_key=voice_cloning_key,
            language_code=language_code,
        )


# Singleton para reutilizar cliente
_service_instance = None


def get_tts_service() -> GCPTextToSpeechService:
    """Retorna instancia singleton do servico TTS."""
    global _service_instance
    if _service_instance is None:
        _service_instance = GCPTextToSpeechService()
    return _service_instance
