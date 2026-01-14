import React from 'react';
import { Upload, Brain, Copy, AudioLines, CheckCircle2 } from 'lucide-react';
import { ProcessingStep } from '../types';

interface ProcessingStepsProps {
  currentStep: ProcessingStep;
}

const steps: { key: ProcessingStep; label: string; icon: React.ReactNode }[] = [
  { key: 'uploading', label: 'Uploading', icon: <Upload size={16} /> },
  { key: 'analyzing', label: 'Analyzing', icon: <Brain size={16} /> },
  { key: 'cloning', label: 'Cloning', icon: <Copy size={16} /> },
  { key: 'synthesizing', label: 'Synthesizing', icon: <AudioLines size={16} /> },
];

export const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(s => s.key === currentStep);
  const isComplete = currentStep === 'complete';
  const isError = currentStep === 'error';

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Steps */}
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-700 mx-8" />

        {/* Animated progress line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 mx-8 transition-all duration-500 ease-out"
          style={{
            width: isComplete
              ? 'calc(100% - 4rem)'
              : `calc(${(currentIndex / (steps.length - 1)) * 100}% - ${currentIndex > 0 ? '0rem' : '0rem'})`,
          }}
        />

        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isPast = currentIndex > index || isComplete;
          const isFuture = currentIndex < index && !isComplete;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-500 ease-out
                  ${isActive
                    ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/50 ring-4 ring-indigo-500/20'
                    : isPast
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }
                `}
              >
                {isPast && !isActive ? (
                  <CheckCircle2 size={18} className="animate-in zoom-in duration-300" />
                ) : (
                  <span className={isActive ? 'animate-pulse' : ''}>{step.icon}</span>
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-30" />
                    <span className="absolute inset-0 rounded-full border border-indigo-300 animate-pulse opacity-50" />
                  </>
                )}
              </div>

              {/* Step label */}
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors duration-300
                  ${isActive ? 'text-indigo-400' : isPast ? 'text-emerald-400' : 'text-slate-500'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current step description */}
      <div className="mt-6 text-center">
        {isComplete ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
              <CheckCircle2 size={16} />
              Voice cloned successfully
            </span>
          </div>
        ) : isError ? (
          <span className="text-rose-400 text-sm">An error occurred. Please try again.</span>
        ) : currentStep !== 'idle' ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-400 text-sm">
              {currentStep === 'uploading' && 'Preparing your audio files...'}
              {currentStep === 'analyzing' && 'Analyzing voice characteristics...'}
              {currentStep === 'cloning' && 'Creating voice model with Chirp 3...'}
              {currentStep === 'synthesizing' && 'Generating speech output...'}
            </span>
            <span className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
