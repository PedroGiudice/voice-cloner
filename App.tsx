import React, { useState, useCallback, useEffect } from 'react';
import { Mic2, AlertCircle, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { ReferenceAudioInput } from './components/ReferenceAudioInput';
import { ConsentAudioInput } from './components/ConsentAudioInput';
import { TargetTextInput } from './components/TargetTextInput';
import { VoiceControls } from './components/VoiceControls';
import { ActionPanel } from './components/ActionPanel';
import { voiceService } from './services/voiceService';
import { VoiceCloneState, VoiceConfig, ProcessingStep } from './types';

// Default consent script (fetched from backend on mount)
const DEFAULT_CONSENT_SCRIPT = "I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model.";

const App: React.FC = () => {
  // Application State
  const [state, setState] = useState<VoiceCloneState>({
    referenceFile: null,
    consentFile: null,
    textInput: '',
    voiceConfig: {
      pitch: 1.0,
      speed: 1.0,
      stability: 0.5,
      similarity: 0.8,
      sampleRate: 24000,
      encoding: 'MP3',
      emotion: 'neutral'
    },
    isProcessing: false,
    processingStep: 'idle',
    resultAudioUrl: null,
    error: null,
  });

  const [consentScript, setConsentScript] = useState(DEFAULT_CONSENT_SCRIPT);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [currentSection, setCurrentSection] = useState<'reference' | 'consent' | 'text' | 'config'>('reference');

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await voiceService.healthCheck();
      setIsBackendOnline(healthy);

      if (healthy) {
        try {
          const { script } = await voiceService.getConsentScript();
          setConsentScript(script);
        } catch (e) {
          console.error('Failed to fetch consent script:', e);
        }
      }
    };
    checkHealth();
  }, []);

  // Derived state
  const canGenerate = !!(
    state.referenceFile &&
    state.consentFile &&
    state.textInput.trim().length > 0 &&
    isBackendOnline
  );

  // Calculate completion percentage for progress indicator
  const completionSteps = [
    !!state.referenceFile,
    !!state.consentFile,
    state.textInput.trim().length > 0,
  ];
  const completionPercentage = (completionSteps.filter(Boolean).length / completionSteps.length) * 100;

  // Handlers
  const handleFileSelect = useCallback((file: File | null) => {
    setState(prev => ({ ...prev, referenceFile: file, error: null, resultAudioUrl: null }));
    if (file) setCurrentSection('consent');
  }, []);

  const handleConsentSelect = useCallback((file: Blob | null) => {
    setState(prev => ({ ...prev, consentFile: file, error: null }));
    if (file) setCurrentSection('text');
  }, []);

  const handleFileError = useCallback((message: string) => {
    setState(prev => ({ ...prev, error: message }));
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setState(prev => ({ ...prev, textInput: text, error: null }));
  }, []);

  const handleConfigChange = useCallback((config: VoiceConfig) => {
    setState(prev => ({ ...prev, voiceConfig: config }));
  }, []);

  const handleProgressUpdate = useCallback((step: ProcessingStep) => {
    setState(prev => ({ ...prev, processingStep: step }));
  }, []);

  const handleGenerate = async () => {
    if (!state.referenceFile || !state.consentFile || !state.textInput) {
      setState(prev => ({ ...prev, error: "Please complete all required fields." }));
      return;
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      processingStep: 'idle',
      error: null,
      resultAudioUrl: null
    }));

    try {
      const audioUrl = await voiceService.cloneVoice({
        referenceFile: state.referenceFile,
        consentFile: state.consentFile,
        text: state.textInput,
        config: state.voiceConfig,
        languageCode: 'pt-BR',
        onProgress: handleProgressUpdate,
      });

      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingStep: 'complete',
        resultAudioUrl: audioUrl
      }));
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingStep: 'error',
        error: e.message || "Voice cloning failed. Please try again."
      }));
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      resultAudioUrl: null,
      processingStep: 'idle',
      error: null,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Mic2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                EchoForge
              </h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">Voice Cloning Studio</p>
            </div>
          </div>

          {/* Backend status indicator */}
          <div className={`
            flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border
            ${isBackendOnline === null
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : isBackendOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }
          `}>
            {isBackendOnline === null ? (
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
            ) : isBackendOnline ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}
            <span>
              {isBackendOnline === null ? 'Checking...' : isBackendOnline ? 'Cloud Run Online' : 'Backend Offline'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-5 gap-6 xl:gap-8 items-start">

          {/* Left Column: Inputs (3 cols) */}
          <section className="xl:col-span-3 space-y-6">
            {/* Step indicators */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              {['Reference Audio', 'Consent', 'Text'].map((step, i) => (
                <React.Fragment key={step}>
                  <span className={`
                    px-2 py-1 rounded-md transition-colors
                    ${completionSteps[i] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}
                  `}>
                    {step}
                  </span>
                  {i < 2 && <ChevronRight size={12} className="text-slate-700" />}
                </React.Fragment>
              ))}
            </div>

            {/* Reference Audio Card */}
            <div className={`
              bg-slate-900 rounded-2xl p-6 border shadow-xl transition-all duration-300
              ${currentSection === 'reference' ? 'border-indigo-500/50 shadow-indigo-500/5' : 'border-slate-800'}
            `}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">1. Source Audio</h2>
                  <p className="text-sm text-slate-500">Upload a clear recording of the voice to clone</p>
                </div>
                {state.referenceFile && (
                  <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                    Ready
                  </span>
                )}
              </div>
              <ReferenceAudioInput
                file={state.referenceFile}
                onFileSelect={handleFileSelect}
                onError={handleFileError}
                disabled={state.isProcessing}
              />
            </div>

            {/* Consent Audio Card */}
            <div className={`
              bg-slate-900 rounded-2xl p-6 border shadow-xl transition-all duration-300
              ${currentSection === 'consent' ? 'border-indigo-500/50 shadow-indigo-500/5' : 'border-slate-800'}
              ${!state.referenceFile ? 'opacity-50 pointer-events-none' : ''}
            `}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">2. Voice Consent</h2>
                  <p className="text-sm text-slate-500">Required by Google for ethical AI usage</p>
                </div>
                {state.consentFile && (
                  <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                    Recorded
                  </span>
                )}
              </div>
              <ConsentAudioInput
                file={state.consentFile}
                onFileSelect={handleConsentSelect}
                onError={handleFileError}
                disabled={state.isProcessing || !state.referenceFile}
                consentScript={consentScript}
              />
            </div>

            {/* Text Input Card */}
            <div className={`
              bg-slate-900 rounded-2xl p-6 border shadow-xl transition-all duration-300
              ${currentSection === 'text' ? 'border-indigo-500/50 shadow-indigo-500/5' : 'border-slate-800'}
              ${!state.consentFile ? 'opacity-50 pointer-events-none' : ''}
            `}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-100">3. Target Text</h2>
                <p className="text-sm text-slate-500">Enter the text for the cloned voice to speak</p>
              </div>
              <TargetTextInput
                text={state.textInput}
                onTextChange={handleTextChange}
                disabled={state.isProcessing || !state.consentFile}
              />
            </div>

            {/* Voice Configuration */}
            <div className={`transition-all duration-300 ${!state.consentFile ? 'opacity-50 pointer-events-none' : ''}`}>
              <VoiceControls
                config={state.voiceConfig}
                onChange={handleConfigChange}
                disabled={state.isProcessing || !state.consentFile}
              />
            </div>

            {/* Error Display */}
            {state.error && (
              <div className="bg-rose-900/20 border border-rose-900/50 text-rose-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">{state.error}</span>
              </div>
            )}
          </section>

          {/* Right Column: Output (2 cols) */}
          <section className="xl:col-span-2">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl sticky top-24">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-slate-100">Synthesis</h2>
                <p className="text-sm text-slate-500">Generate and preview the result</p>
              </div>

              <ActionPanel
                onGenerate={handleGenerate}
                isProcessing={state.isProcessing}
                processingStep={state.processingStep}
                canGenerate={canGenerate}
                resultUrl={state.resultAudioUrl}
                onReset={handleReset}
              />
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <span>Powered by Google Cloud TTS (Chirp 3 HD)</span>
          <span>EchoForge v2.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
