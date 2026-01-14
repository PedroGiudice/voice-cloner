import React from 'react';
import { Sparkles, Download, Play, Pause, RotateCcw } from 'lucide-react';
import { ProcessingStep } from '../types';
import { ProcessingSteps } from './ProcessingSteps';

interface ActionPanelProps {
  onGenerate: () => void;
  isProcessing: boolean;
  processingStep: ProcessingStep;
  canGenerate: boolean;
  resultUrl: string | null;
  onReset?: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  onGenerate,
  isProcessing,
  processingStep,
  canGenerate,
  resultUrl,
  onReset,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [resultUrl]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 h-full min-h-[350px] p-6">
      {/* Processing visualization */}
      {isProcessing && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProcessingSteps currentStep={processingStep} />
        </div>
      )}

      {/* Generate button */}
      {!isProcessing && !resultUrl && (
        <div className="w-full max-w-sm space-y-4 animate-in fade-in duration-300">
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className={`
              w-full relative group overflow-hidden
              flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg
              transition-all duration-300 transform active:scale-[0.98]
              ${!canGenerate
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/25 border border-indigo-500/50 hover:shadow-indigo-500/40'
              }
            `}
            style={{
              backgroundSize: canGenerate ? '200% 100%' : '100% 100%',
              animation: canGenerate ? 'shimmer 3s linear infinite' : 'none',
            }}
          >
            {/* Shine effect */}
            {canGenerate && (
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}

            <Sparkles className={canGenerate ? "animate-pulse" : ""} size={22} />
            <span>Generate Cloned Voice</span>
          </button>

          {!canGenerate && (
            <p className="text-center text-xs text-slate-500">
              Upload reference audio, record consent, and enter text to begin
            </p>
          )}
        </div>
      )}

      {/* Result Player */}
      {resultUrl && !isProcessing && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-emerald-500/30 shadow-xl shadow-emerald-500/10">
            {/* Success header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                <h3 className="text-sm font-semibold text-slate-200">Voice Generated</h3>
              </div>
              <span className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-medium">
                Ready to play
              </span>
            </div>

            {/* Custom audio player */}
            <div className="space-y-4">
              {/* Play button and waveform placeholder */}
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    transition-all duration-300 transform active:scale-95
                    ${isPlaying
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }
                  `}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                {/* Waveform visualization */}
                <div className="flex-1 h-14 flex items-center gap-0.5">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className={`
                        flex-1 rounded-full transition-all duration-150
                        ${isPlaying ? 'bg-emerald-400' : 'bg-slate-600'}
                      `}
                      style={{
                        height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 20}%`,
                        opacity: isPlaying ? 0.6 + Math.random() * 0.4 : 0.5,
                        animation: isPlaying ? `waveform ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate` : 'none',
                        animationDelay: `${i * 20}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Hidden native audio */}
              <audio ref={audioRef} src={resultUrl} className="hidden" />

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <button
                  onClick={onReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
                >
                  <RotateCcw size={16} />
                  <span>Generate new</span>
                </button>

                <a
                  href={resultUrl}
                  download="cloned-voice.mp3"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors rounded-lg hover:bg-indigo-500/10"
                >
                  <Download size={16} />
                  <span>Download MP3</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes waveform {
          0% { transform: scaleY(0.5); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};
