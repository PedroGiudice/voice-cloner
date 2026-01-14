import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Zap, Music, Heart, ChevronDown, Waves, Fingerprint, FileCode, Activity } from 'lucide-react';
import { VoiceConfig, AudioEncoding } from '../types';

interface VoiceControlsProps {
  config: VoiceConfig;
  onChange: (config: VoiceConfig) => void;
  disabled?: boolean;
}

// Custom hook for spring animation
function useSpringHeight(isOpen: boolean, contentRef: React.RefObject<HTMLDivElement | null>) {
  const [height, setHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const targetHeight = isOpen ? contentRef.current.scrollHeight : 0;
      setHeight(targetHeight);
      setIsAnimating(true);

      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, contentRef]);

  return { height, isAnimating };
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ config, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { height, isAnimating } = useSpringHeight(isOpen, contentRef);

  const handleChange = (key: keyof VoiceConfig, value: string | number) => {
    onChange({ ...config, [key]: value });
  };

  // Slider with enhanced interaction
  const Slider: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
    configKey: keyof VoiceConfig;
    index: number;
  }> = ({ label, icon, value, min, max, step, format, configKey, index }) => {
    const isActive = activeControl === configKey;
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div
        className={`
          space-y-3 p-4 rounded-xl transition-all duration-300
          ${isActive ? 'bg-indigo-500/10 scale-[1.02]' : 'bg-transparent hover:bg-slate-800/50'}
        `}
        style={{
          animationDelay: `${index * 50}ms`,
          animation: isOpen ? 'slideUp 0.4s ease-out forwards' : 'none',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="flex justify-between items-center text-xs">
          <label className={`font-medium flex items-center gap-2 transition-colors duration-200 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
            {icon} {label}
          </label>
          <span className={`
            font-mono px-2 py-1 rounded transition-all duration-200
            ${isActive
              ? 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 scale-110'
              : 'text-indigo-400 bg-indigo-950/50 border border-indigo-500/20'
            }
          `}>
            {format(value)}
          </span>
        </div>

        {/* Custom slider track */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Filled track with gradient */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />

          {/* Glow effect when active */}
          {isActive && (
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full blur-sm opacity-50"
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(configKey, parseFloat(e.target.value))}
          onFocus={() => setActiveControl(configKey)}
          onBlur={() => setActiveControl(null)}
          onMouseEnter={() => setActiveControl(configKey)}
          onMouseLeave={() => !document.activeElement?.closest(`[data-key="${configKey}"]`) && setActiveControl(null)}
          data-key={configKey}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ marginTop: '-1.5rem', height: '3rem' }}
        />
      </div>
    );
  };

  return (
    <div className={`
      border rounded-2xl overflow-hidden transition-all duration-500
      ${isOpen
        ? 'border-indigo-500/50 bg-slate-900/80 shadow-lg shadow-indigo-500/10'
        : 'border-slate-700 bg-slate-900/50'
      }
    `}>
      {/* Dropdown Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between p-4 text-left transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/50'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-lg transition-all duration-300
            ${isOpen
              ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-800 text-slate-400'
            }
          `}>
            <Sliders size={18} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200 block">Voice Configuration</span>
            <span className="text-xs text-slate-500">Cloud TTS Parameters</span>
          </div>
        </div>

        {/* Animated chevron */}
        <div className={`
          p-1 rounded-full transition-all duration-300
          ${isOpen ? 'bg-indigo-500/20 text-indigo-400 rotate-180' : 'text-slate-500'}
        `}>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Dropdown Content with spring animation */}
      <div
        className="overflow-hidden transition-all duration-400"
        style={{
          height: isAnimating ? height : (isOpen ? 'auto' : 0),
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="border-t border-slate-700/50">
          <div className="p-4 space-y-2">
            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Slider
                label="Pitch"
                icon={<Music size={14} />}
                value={config.pitch}
                min={0.5}
                max={2.0}
                step={0.1}
                format={(v) => `${v.toFixed(1)}x`}
                configKey="pitch"
                index={0}
              />
              <Slider
                label="Speed"
                icon={<Zap size={14} />}
                value={config.speed}
                min={0.5}
                max={2.0}
                step={0.1}
                format={(v) => `${v.toFixed(1)}x`}
                configKey="speed"
                index={1}
              />
              <Slider
                label="Stability"
                icon={<Waves size={14} />}
                value={config.stability}
                min={0.0}
                max={1.0}
                step={0.05}
                format={(v) => `${(v * 100).toFixed(0)}%`}
                configKey="stability"
                index={2}
              />
              <Slider
                label="Similarity"
                icon={<Fingerprint size={14} />}
                value={config.similarity}
                min={0.0}
                max={1.0}
                step={0.05}
                format={(v) => `${(v * 100).toFixed(0)}%`}
                configKey="similarity"
                index={3}
              />
            </div>

            {/* Selects row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
              {/* Sample Rate */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <Activity size={14} /> Sample Rate
                </label>
                <select
                  value={config.sampleRate}
                  onChange={(e) => handleChange('sampleRate', parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl
                    focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3
                    transition-all duration-200 hover:border-slate-600"
                >
                  <option value={24000}>24,000 Hz (Standard)</option>
                  <option value={44100}>44,100 Hz (CD Quality)</option>
                  <option value={48000}>48,000 Hz (Studio)</option>
                </select>
              </div>

              {/* Audio Format */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <FileCode size={14} /> Format
                </label>
                <select
                  value={config.encoding}
                  onChange={(e) => handleChange('encoding', e.target.value as AudioEncoding)}
                  disabled={disabled}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl
                    focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3
                    transition-all duration-200 hover:border-slate-600"
                >
                  <option value="MP3">MP3</option>
                  <option value="LINEAR16">Linear16 (WAV)</option>
                  <option value="OGG_OPUS">Ogg Opus</option>
                  <option value="MULAW">Mu-law</option>
                </select>
              </div>
            </div>

            {/* Emotional Tone */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-2 mb-3">
                <Heart size={14} /> Emotional Tone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['neutral', 'happy', 'serious'] as const).map((tone, index) => (
                  <button
                    key={tone}
                    onClick={() => handleChange('emotion', tone)}
                    disabled={disabled}
                    className={`
                      relative px-4 py-3 rounded-xl text-xs font-semibold capitalize
                      border transition-all duration-300 overflow-hidden
                      ${config.emotion === tone
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50 scale-105'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-700'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    style={{
                      animationDelay: `${(4 + index) * 50}ms`,
                    }}
                  >
                    {/* Selection indicator */}
                    {config.emotion === tone && (
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-50" />
                    )}
                    <span className="relative">{tone}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
