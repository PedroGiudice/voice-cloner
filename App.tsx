import React, { useState, useCallback } from 'react';
import { Mic2, AlertCircle } from 'lucide-react';
import { ReferenceAudioInput } from './components/ReferenceAudioInput';
import { TargetTextInput } from './components/TargetTextInput';
import { VoiceControls } from './components/VoiceControls';
import { ActionPanel } from './components/ActionPanel';
import { internalGoogleAIService } from './services/voiceService';
import { VoiceCloneState, VoiceConfig } from './types';

const App: React.FC = () => {
  // Application State
  const [state, setState] = useState<VoiceCloneState>({
    referenceFile: null,
    textInput: '',
    voiceConfig: {
      pitch: 0.0, // 0.0 is default/natural in Google Cloud TTS
      speed: 1.0,
      stability: 0.5,
      similarity: 0.8,
      sampleRate: 24000,
      encoding: 'MP3',
      emotion: 'neutral'
    },
    isProcessing: false,
    resultAudioUrl: null,
    error: null,
  });

  // Derived state to disable/enable the generate button
  const canGenerate = !!(state.referenceFile && state.textInput.trim().length > 0);

  // Handlers
  const handleFileSelect = useCallback((file: File | null) => {
    setState(prev => ({ ...prev, referenceFile: file, error: null, resultAudioUrl: null }));
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

  const handleGenerate = async () => {
    if (!state.referenceFile || !state.textInput) {
      setState(prev => ({ ...prev, error: "Missing requirements. Please upload audio and enter text." }));
      return;
    }

    // Start Processing
    setState(prev => ({ ...prev, isProcessing: true, error: null, resultAudioUrl: null }));

    try {
      // Execute Mock Service with Config
      const audioUrl = await internalGoogleAIService.cloneVoice(
        state.referenceFile, 
        state.textInput,
        state.voiceConfig
      );
      
      // Handle Success
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        resultAudioUrl: audioUrl 
      }));
    } catch (e: any) {
      // Handle Error (even mock services might throw in real scenarios)
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: e.message || "Failed to synthesize voice. Please try again." 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Mic2 size={18} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              EchoForge <span className="font-light text-slate-600">| Voice Cloner</span>
            </h1>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-slate-800 text-indigo-400 rounded border border-slate-700/50">
            Cloud Run Ready
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Input Zone */}
          <section className="flex flex-col gap-6">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-1">Source Audio</h2>
                <p className="text-sm text-slate-500 mb-4">Upload a clear recording of the voice you wish to clone.</p>
                <ReferenceAudioInput 
                  file={state.referenceFile} 
                  onFileSelect={handleFileSelect}
                  onError={handleFileError}
                  disabled={state.isProcessing}
                />
              </div>

              <div className="border-t border-slate-800 pt-6">
                <TargetTextInput 
                  text={state.textInput}
                  onTextChange={handleTextChange}
                  disabled={state.isProcessing}
                />
              </div>

              <div className="border-t border-slate-800 pt-6">
                 <VoiceControls 
                   config={state.voiceConfig}
                   onChange={handleConfigChange}
                   disabled={state.isProcessing}
                 />
              </div>
            </div>

            {/* Global Error Display */}
            {state.error && (
              <div className="bg-rose-900/20 border border-rose-900/50 text-rose-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">{state.error}</span>
              </div>
            )}
          </section>

          {/* Right Column: Output Zone */}
          <section className="flex flex-col h-full">
             <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl h-full flex flex-col sticky top-24">
                 <h2 className="text-lg font-semibold text-slate-100 mb-1">Synthesis</h2>
                 <p className="text-sm text-slate-500 mb-6">Generate and listen to the result.</p>
                 
                 <div className="flex-grow">
                    <ActionPanel 
                      onGenerate={handleGenerate}
                      isProcessing={state.isProcessing}
                      canGenerate={canGenerate}
                      resultUrl={state.resultAudioUrl}
                    />
                 </div>
             </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default App;