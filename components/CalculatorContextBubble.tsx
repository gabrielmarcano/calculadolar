import React from 'react';

interface CalculatorContextBubbleProps {
  isOpen: boolean;
  input: string;
  onPaste: () => void;
  onCopy: () => void;
}

export default function CalculatorContextBubble({
  isOpen,
  input,
  onPaste,
  onCopy,
}: CalculatorContextBubbleProps) {
  if (!isOpen) return null;

  const canCopy = input && input !== '0' && input.trim().length > 0;

  return (
    <div className="absolute -top-12 right-0 z-40 flex items-center bg-[#222228]/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl py-1 px-1.5 animate-in zoom-in-95 duration-150 select-none">
      {canCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 active:bg-white/15 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[40px]"
          aria-label="Copiar cuenta"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-zinc-300"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>Copiar</span>
        </button>
      )}

      {canCopy && <div className="w-px h-5 bg-white/20 mx-0.5" />}

      <button
        type="button"
        onClick={onPaste}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 active:bg-white/15 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[40px]"
        aria-label="Pegar cuenta"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-sky-400"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
        <span>Pegar</span>
      </button>
    </div>
  );
}
