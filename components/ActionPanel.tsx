import React from 'react';
import { Loader2, Sparkles, Download } from 'lucide-react';

interface ActionPanelProps {
  onGenerate: () => void;
  isProcessing: boolean;
  canGenerate: boolean;
  resultUrl: string | null;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ 
  onGenerate, 
  isProcessing, 
  canGenerate, 
  resultUrl 
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 flex flex-col items-center justify-center space-y-8 h-full min-h-[300px]">
      
      {/* Component C: Action & Status */}
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isProcessing}
          className={`
            w-full relative group overflow-hidden
            flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-lg
            transition-all duration-300 transform active:scale-[0.98]
            ${!canGenerate || isProcessing 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 border border-indigo-500/50'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className={canGenerate ? "animate-pulse" : ""} size={20} />
              <span>Generate Cloned Voice</span>
            </>
          )}
        </button>
        
        {!canGenerate && !isProcessing && (
          <p className="text-center text-xs text-slate-500">
            Upload audio and enter text to begin
          </p>
        )}
      </div>

      {/* Component D: Result Player */}
      {resultUrl && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Generation Complete
              </h3>
              <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-medium">
                Success
              </span>
            </div>
            
            <audio 
              controls 
              src={resultUrl} 
              className="w-full h-12 rounded-lg invert brightness-90 contrast-200 sepia-[.2]"
              style={{ filter: "invert(100%)" }} 
              autoPlay={false}
            >
              Your browser does not support the audio element.
            </audio>

            <div className="mt-4 flex justify-end">
               <a 
                 href={resultUrl} 
                 download="cloned-voice.ogg" 
                 className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
               >
                 <Download size={14} /> Download Audio
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};