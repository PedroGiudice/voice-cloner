import React, { useState } from 'react';
import { Sliders, Zap, Music, Heart, ChevronDown, ChevronUp, Waves, Fingerprint, FileCode, Activity } from 'lucide-react';
import { VoiceConfig, AudioEncoding } from '../types';

interface VoiceControlsProps {
  config: VoiceConfig;
  onChange: (config: VoiceConfig) => void;
  disabled?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ config, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof VoiceConfig, value: string | number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-900/50 overflow-hidden transition-all duration-300">
      
      {/* Dropdown Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
             <Sliders size={16} />
          </div>
          <span className="text-sm font-semibold text-slate-200">Voice Configuration (Cloud TTS)</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {/* Dropdown Content */}
      <div className={`
        border-t border-slate-700/50 bg-slate-900
        transition-all duration-300 ease-in-out origin-top
        ${isOpen ? 'max-h-[800px] opacity-100 p-6' : 'max-h-0 opacity-0 p-0 overflow-hidden'}
      `}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Pitch Control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-400 flex items-center gap-1.5">
                <Music size={14} /> Pitch
              </label>
              <span className="text-indigo-400 font-mono bg-indigo-950/50 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {config.pitch.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={config.pitch}
              disabled={disabled}
              onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Speed Control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-400 flex items-center gap-1.5">
                <Zap size={14} /> Speed
              </label>
              <span className="text-indigo-400 font-mono bg-indigo-950/50 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {config.speed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={config.speed}
              disabled={disabled}
              onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Stability Control */}
           <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-400 flex items-center gap-1.5">
                <Waves size={14} /> Stability
              </label>
              <span className="text-indigo-400 font-mono bg-indigo-950/50 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {(config.stability * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={config.stability}
              disabled={disabled}
              onChange={(e) => handleChange('stability', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Similarity Boost Control */}
           <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-400 flex items-center gap-1.5">
                <Fingerprint size={14} /> Similarity
              </label>
              <span className="text-indigo-400 font-mono bg-indigo-950/50 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {(config.similarity * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={config.similarity}
              disabled={disabled}
              onChange={(e) => handleChange('similarity', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          
           {/* Sample Rate */}
           <div className="space-y-3">
             <div className="flex justify-between items-center text-xs">
               <label className="font-medium text-slate-400 flex items-center gap-1.5">
                 <Activity size={14} /> Sample Rate
               </label>
             </div>
             <select
               value={config.sampleRate}
               onChange={(e) => handleChange('sampleRate', parseInt(e.target.value))}
               disabled={disabled}
               className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
             >
               <option value={24000}>24,000 Hz (Standard)</option>
               <option value={44100}>44,100 Hz (CD Quality)</option>
               <option value={48000}>48,000 Hz (Studio)</option>
             </select>
           </div>

           {/* Audio Encoding */}
           <div className="space-y-3">
             <div className="flex justify-between items-center text-xs">
               <label className="font-medium text-slate-400 flex items-center gap-1.5">
                 <FileCode size={14} /> Format
               </label>
             </div>
             <select
               value={config.encoding}
               onChange={(e) => handleChange('encoding', e.target.value as AudioEncoding)}
               disabled={disabled}
               className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
             >
               <option value="MP3">MP3</option>
               <option value="LINEAR16">Linear16 (WAV)</option>
               <option value="OGG_OPUS">Ogg Opus</option>
               <option value="MULAW">Mu-law</option>
             </select>
           </div>

        </div>

        {/* Emotional Tone */}
        <div className="space-y-3 mt-6 pt-6 border-t border-slate-800">
          <label className="block text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-2">
            <Heart size={14} /> Emotional Tone Hint (If supported)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['neutral', 'happy', 'serious'].map((tone) => (
              <button
                key={tone}
                onClick={() => handleChange('emotion', tone)}
                disabled={disabled}
                className={`
                  px-3 py-2.5 rounded-lg text-xs font-semibold capitalize border transition-all duration-200
                  ${config.emotion === tone
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-700'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};