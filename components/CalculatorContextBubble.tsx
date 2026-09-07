import React from 'react';

interface CalculatorContextBubbleProps {
  showResumeSuggestion: boolean;
  showContextBubble: boolean;
  input: string;
  onPaste: () => void;
  onCopy: () => void;
  onDismissResume: () => void;
}

export default function CalculatorContextBubble({
  showResumeSuggestion,
  showContextBubble,
  input,
  onPaste,
  onCopy,
  onDismissResume,
}: CalculatorContextBubbleProps) {
  return (
    <>
      {/* Smart Resume Suggestion (Appears when returning from another app) */}
      {showResumeSuggestion && (
        <div className="absolute -top-9 right-0 z-30 flex items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={onPaste}
            className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#333333] text-gray-200 border border-white/15 px-3 py-1 rounded-full text-xs font-medium shadow-xl active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-400">
              <path fillRule="evenodd" d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.5A2.5 2.5 0 0 1 14.5 19h-9A2.5 2.5 0 0 1 3 16.5V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 0 1 9 1h2c1.373 0 2.531.923 2.887 2.182ZM7.5 4A1.5 1.5 0 0 1 9 2.5h2A1.5 1.5 0 0 1 12.5 4v.5h-5V4Z" clipRule="evenodd" />
            </svg>
            <span>Pegar portapapeles</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismissResume();
              }}
              className="text-gray-400 hover:text-gray-200 ml-1.5 p-1 -mr-1 rounded-full hover:bg-white/10 active:scale-90 transition-transform flex items-center justify-center min-w-[28px] min-h-[28px]"
              aria-label="Cerrar sugerencia"
            >
              ✕
            </button>
          </button>
        </div>
      )}

      {/* Contextual Action Bubble (Triggered on long-press) */}
      {showContextBubble && (
        <div className="absolute -top-9 right-0 z-30 flex items-center bg-[#252525] border border-white/15 rounded-full shadow-2xl overflow-hidden py-0.5 px-1 animate-in zoom-in-95 duration-150">
          {input && input !== '0' && (
            <button
              onClick={onCopy}
              className="px-3 py-1 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              Copiar
            </button>
          )}
          {input && input !== '0' && <div className="w-[1px] h-3 bg-white/20 my-auto" />}
          <button
            onClick={onPaste}
            className="px-3 py-1 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-400">
              <path fillRule="evenodd" d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.5A2.5 2.5 0 0 1 14.5 19h-9A2.5 2.5 0 0 1 3 16.5V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 0 1 9 1h2c1.373 0 2.531.923 2.887 2.182ZM7.5 4A1.5 1.5 0 0 1 9 2.5h2A1.5 1.5 0 0 1 12.5 4v.5h-5V4Z" clipRule="evenodd" />
            </svg>
            <span>Pegar</span>
          </button>
        </div>
      )}
    </>
  );
}
