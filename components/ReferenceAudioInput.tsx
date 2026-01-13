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
    // Basic validation for audio types
    if (candidate.type.startsWith('audio/') || candidate.name.endsWith('.wav') || candidate.name.endsWith('.mp3')) {
      onFileSelect(candidate);
    } else {
      onError("Invalid file format. Please upload an MP3 or WAV file.");
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Reference Voice <span className="text-rose-500">*</span>
      </label>
      
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
            ? 'border-indigo-500 bg-indigo-50/50' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed hover:border-slate-300 hover:bg-transparent' : ''}
          ${file ? 'bg-indigo-50/30 border-indigo-200 border-solid' : ''}
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
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileAudio size={32} />
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px] mx-auto">
              {file.name}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {!disabled && (
               <button 
                onClick={clearFile}
                className="mt-4 inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 rounded-full hover:bg-rose-100 transition-colors"
               >
                 <X size={14} className="mr-1" /> Remove
               </button>
            )}
          </div>
        ) : (
          <div className="pointer-events-none">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-medium text-slate-900">
              {isDragging ? 'Drop audio here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports WAV, MP3 (Max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};