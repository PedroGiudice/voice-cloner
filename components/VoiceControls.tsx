import React from 'react';
import { Sliders, Zap, Music, Heart } from 'lucide-react';
import { VoiceConfig } from '../types';

interface VoiceControlsProps {
  config: VoiceConfig;
  onChange: (config: VoiceConfig) => void;
  disabled?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ config, onChange, disabled }) => {
  const handleChange = (key: keyof VoiceConfig, value: string | number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sliders size={18} className="text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700">Voice Customization</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pitch Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-medium text-slate-600 flex items-center gap-1.5">
              <Music size={14} /> Pitch
            </label>
            <span className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">
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
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-medium text-slate-600 flex items-center gap-1.5">
              <Zap size={14} /> Speaking Rate
            </label>
            <span className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">
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
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>

      {/* Emotional Tone */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-medium text-slate-600 flex items-center gap-1.5 mb-1.5">
          <Heart size={14} /> Emotional Tone
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['neutral', 'happy', 'serious'].map((tone) => (
            <button
              key={tone}
              onClick={() => handleChange('emotion', tone)}
              disabled={disabled}
              className={`
                px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-all duration-200
                ${config.emotion === tone
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
  );
};