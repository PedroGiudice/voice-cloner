import React from 'react';

interface TargetTextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 500;

export const TargetTextInput: React.FC<TargetTextInputProps> = ({ text, onTextChange, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      onTextChange(newText);
    }
  };

  const charCount = text.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-300">
          Target Text <span className="text-indigo-400">*</span>
        </label>
        <span className={`text-xs font-medium transition-colors ${isNearLimit ? 'text-amber-500' : 'text-slate-500'}`}>
          {charCount} / {MAX_CHARS}
        </span>
      </div>
      
      <div className="relative flex-grow">
        <textarea
          value={text}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Enter the text you want the cloned voice to speak..."
          className={`
            w-full h-full min-h-[160px] p-4 rounded-xl resize-none
            border-2 text-base leading-relaxed
            focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200
            ${disabled 
                ? 'bg-slate-900/30 text-slate-600 border-slate-800 cursor-not-allowed placeholder-slate-700' 
                : 'bg-slate-900 text-slate-200 border-slate-700 placeholder-slate-500 focus:border-indigo-500'
            }
          `}
        />
        {/* Visual decoration for the corner */}
        {!disabled && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          </div>
        )}
      </div>
    </div>
  );
};