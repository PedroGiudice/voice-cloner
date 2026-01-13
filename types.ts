export interface VoiceConfig {
    pitch: number;
    speed: number;
    emotion: string;
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