import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, AlertTriangle, CheckCircle2, Volume2, RotateCcw } from 'lucide-react';

interface ConsentAudioInputProps {
  file: Blob | null;
  onFileSelect: (file: Blob | null) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  consentScript: string;
}

export const ConsentAudioInput: React.FC<ConsentAudioInputProps> = ({
  file,
  onFileSelect,
  onError,
  disabled,
  consentScript,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(url);
        onFileSelect(blob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setShowScript(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      onError('Microphone access denied. Please allow microphone access to record consent.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onFileSelect(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Header with legal notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-amber-300">Legal Requirement</h3>
          <p className="text-xs text-amber-200/80 mt-1">
            Google requires voice consent for ethical AI usage. Record yourself speaking the script below.
          </p>
        </div>
      </div>

      {/* Consent Script Card */}
      <div
        className={`
          relative overflow-hidden rounded-xl border-2 transition-all duration-500
          ${isRecording
            ? 'border-rose-500 bg-rose-500/5 shadow-lg shadow-rose-500/20'
            : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-slate-700 bg-slate-900/50'
          }
        `}
      >
        {/* Recording indicator pulse */}
        {isRecording && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-rose-500/5 animate-pulse" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-mono text-rose-400">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Script display */}
          <div className={`transition-all duration-300 ${showScript ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Volume2 size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Read this aloud:
              </span>
            </div>

            <blockquote className={`
              text-lg leading-relaxed font-medium p-4 rounded-lg border-l-4 transition-colors duration-300
              ${isRecording
                ? 'text-slate-100 bg-slate-800/50 border-rose-500'
                : 'text-slate-300 bg-slate-800/30 border-indigo-500'
              }
            `}>
              "{consentScript}"
            </blockquote>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {!file ? (
              // Record button
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={`
                  relative group flex items-center gap-3 px-6 py-3 rounded-full font-semibold
                  transition-all duration-300 transform active:scale-95
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isRecording
                    ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/30'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                  }
                `}
              >
                {isRecording ? (
                  <>
                    <Square size={18} className="fill-current" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    <span>Start Recording</span>
                  </>
                )}

                {/* Animated ring when recording */}
                {isRecording && (
                  <span className="absolute -inset-1 rounded-full border-2 border-rose-400 animate-ping opacity-20" />
                )}
              </button>
            ) : (
              // Playback and reset
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-medium">Consent recorded successfully</span>
                </div>

                {audioUrl && (
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full max-w-md h-10 rounded-lg"
                    style={{ filter: "invert(100%) hue-rotate(180deg)" }}
                  />
                )}

                <button
                  onClick={resetRecording}
                  disabled={disabled}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Record again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
