import { VoiceConfig, ProcessingStep } from '../types';

// Backend URL - Cloud Run deployed service
const API_BASE_URL = 'https://voice-cloner-api-105426697046.us-west1.run.app';

export interface CloneVoiceOptions {
  referenceFile: File;
  consentFile: Blob;
  text: string;
  config: VoiceConfig;
  languageCode?: string;
  onProgress?: (step: ProcessingStep) => void;
}

export interface ConsentScriptResponse {
  script: string;
  instructions: string;
}

/**
 * Voice Cloning Service
 * Integrates with Google Cloud TTS via Cloud Run backend
 */
export const voiceService = {
  /**
   * Get the consent script that users must read
   */
  async getConsentScript(): Promise<ConsentScriptResponse> {
    const response = await fetch(`${API_BASE_URL}/consent-script`);
    if (!response.ok) {
      throw new Error('Failed to fetch consent script');
    }
    return response.json();
  },

  /**
   * Clone voice using reference audio and consent
   */
  async cloneVoice(options: CloneVoiceOptions): Promise<string> {
    const {
      referenceFile,
      consentFile,
      text,
      config,
      languageCode = 'pt-BR',
      onProgress,
    } = options;

    // Step 1: Uploading
    onProgress?.('uploading');
    await delay(300); // Small delay for visual feedback

    // Validate inputs
    if (!referenceFile || referenceFile.size === 0) {
      throw new Error('Reference audio is required');
    }
    if (!consentFile || consentFile.size === 0) {
      throw new Error('Consent audio is required');
    }
    if (!text.trim()) {
      throw new Error('Text is required');
    }

    // Step 2: Analyzing
    onProgress?.('analyzing');

    // Build form data
    const formData = new FormData();
    formData.append('reference_audio', referenceFile);
    formData.append('consent_audio', consentFile, 'consent.webm');
    formData.append('text', text);
    formData.append('language_code', languageCode);

    // Step 3: Cloning
    onProgress?.('cloning');

    console.group('[Voice Cloner] API Request');
    console.log('Endpoint:', `${API_BASE_URL}/api/clone-voice`);
    console.log('Reference:', referenceFile.name, `(${(referenceFile.size / 1024).toFixed(1)} KB)`);
    console.log('Consent:', `(${(consentFile.size / 1024).toFixed(1)} KB)`);
    console.log('Text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    console.log('Language:', languageCode);
    console.log('Config:', config);
    console.groupEnd();

    // Step 4: Synthesizing (API call)
    onProgress?.('synthesizing');

    const response = await fetch(`${API_BASE_URL}/api/clone-voice`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Voice cloning failed';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Get audio blob from response
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Step 5: Complete
    onProgress?.('complete');

    console.log('[Voice Cloner] Success! Audio URL:', audioUrl);
    return audioUrl;
  },

  /**
   * Check if the backend is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  },
};

// Helper function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Legacy export for backwards compatibility
export const internalGoogleAIService = {
  cloneVoice: async (referenceFile: File, targetText: string, config: VoiceConfig): Promise<string> => {
    console.warn('[DEPRECATED] Using mock service. Please update to use voiceService.cloneVoice()');

    // Mock implementation for testing without consent
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("https://actions.google.com/sounds/v1/science_fiction/digital_glitch.ogg");
      }, 3000);
    });
  }
};
