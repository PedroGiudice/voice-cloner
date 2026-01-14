export type AudioEncoding = 'MP3' | 'LINEAR16' | 'OGG_OPUS' | 'MULAW';

export interface VoiceConfig {
    pitch: number;
    speed: number;
    stability: number;
    similarity: number;
    sampleRate: number;
    encoding: AudioEncoding;
    emotion: string; // Kept for metadata/style hints if supported by custom implementations
}

export interface VoiceCloneState {
    referenceFile: File | null;
    textInput: string;
    voiceConfig: VoiceConfig;
    isProcessing: boolean;
    resultAudioUrl: string | null;
    error: string | null;
}

export interface DragState {
    isDragging: boolean;
}