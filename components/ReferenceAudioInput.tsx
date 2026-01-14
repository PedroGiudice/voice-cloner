import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X } from 'lucide-react';

interface ReferenceAudioInputProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export const ReferenceAudioInput: React.FC<ReferenceAudioInputProps> = ({ file, onFileSelect, onError, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (candidate: File) => {
    // Google Cloud TTS Instant Voice robustness checks
    // Ideally > 30s of audio, mono/stereo, WAV/MP3/Linear16
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/x-wav'];
    const maxSize = 10 * 1024 * 1024; // 10MB limit check

    if (!candidate.type.startsWith('audio/') && !candidate.name.match(/\.(mp3|wav)$/i)) {
       onError("Invalid format. Please upload WAV or MP3 (Linear16 preferred for API).");
       return;
    }

    if (candidate.size > maxSize) {
        onError("File too large. Reference audio should be under 10MB for instant cloning.");
        return;
    }

    onFileSelect(candidate);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-300">
            Reference Audio <span className="text-indigo-400">*</span>
        </label>
        <span className="text-[10px] text-slate-500 uppercase tracking-wide">For chirp-3-hd</span>
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative group cursor-pointer transition-all duration-200 ease-in-out
          border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center
          min-h-[200px]
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed hover:border-slate-700 hover:bg-transparent' : ''}
          ${file ? 'bg-indigo-900/20 border-indigo-500/50 border-solid' : 'bg-slate-900/50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.wav,.mp3"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {file ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
              <FileAudio size={32} />
            </div>
            <p className="text-sm font-semibold text-slate-200 truncate max-w-[200px] mx-auto">
              {file.name}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {!disabled && (
               <button 
                onClick={clearFile}
                className="mt-4 inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full hover:bg-rose-500/20 transition-colors"
               >
                 <X size={14} className="mr-1" /> Remove
               </button>
            )}
          </div>
        ) : (
          <div className="pointer-events-none">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500 group-hover:bg-indigo-900/30 group-hover:text-indigo-400'}`}>
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-medium text-slate-300">
              {isDragging ? 'Drop audio here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
              Single speaker, minimal background noise.
            </p>
            <p className="text-[10px] text-slate-600 mt-2">
              Recommended: Linear16 WAV, 24kHz+
            </p>
          </div>
        )}
      </div>
    </div>
  );
};