import React from 'react';
import { triggerHaptic } from '@/lib/utils';

interface CalculatorKeypadProps {
  onClick: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onCommitResult: () => void;
  onParentheses: () => void;
  onPercent: () => void;
}

interface KeypadButton {
  label: string;
  value: string;
  type: 'func' | 'op' | 'num' | 'equal';
}

const BUTTONS: KeypadButton[] = [
  { label: 'AC', value: 'AC', type: 'func' },
  { label: '( )', value: '()', type: 'func' },
  { label: '%', value: '%', type: 'func' },
  { label: '÷', value: '÷', type: 'op' },

  { label: '7', value: '7', type: 'num' },
  { label: '8', value: '8', type: 'num' },
  { label: '9', value: '9', type: 'num' },
  { label: '×', value: '×', type: 'op' },

  { label: '4', value: '4', type: 'num' },
  { label: '5', value: '5', type: 'num' },
  { label: '6', value: '6', type: 'num' },
  { label: '−', value: '-', type: 'op' },

  { label: '1', value: '1', type: 'num' },
  { label: '2', value: '2', type: 'num' },
  { label: '3', value: '3', type: 'num' },
  { label: '+', value: '+', type: 'op' },

  { label: '0', value: '0', type: 'num' },
  { label: '.', value: '.', type: 'num' },
  { label: '⌫', value: 'BACK', type: 'num' },
  { label: '=', value: '=', type: 'equal' },
];

export default function CalculatorKeypad({
  onClick,
  onBackspace,
  onClear,
  onCommitResult,
  onParentheses,
  onPercent,
}: CalculatorKeypadProps) {
  const handleButtonPress = (btn: KeypadButton) => {
    triggerHaptic();
    if (btn.value === 'AC') onClear();
    else if (btn.value === 'BACK') onBackspace();
    else if (btn.value === '=') onCommitResult();
    else if (btn.value === '()') onParentheses();
    else if (btn.value === '%') onPercent();
    else onClick(btn.value);
  };

  return (
    <div className="flex-1 min-h-0 px-4 pt-2.5 pb-4 bg-[#0a0a0a]">
      <div className="h-full w-full grid grid-cols-4 grid-rows-5 gap-2 sm:gap-2.5">
        {BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleButtonPress(btn)}
            className={`
              h-full w-full rounded-[2rem] sm:rounded-[2.5rem] transition-all active:scale-95 flex items-center justify-center select-none
              
              /* Typography scale: Numbers/Point/Back remain calibrated, outer buttons enlarged */
              ${btn.type === 'num' ? 'text-[38px] sm:text-[40px] font-normal leading-none' : ''}
              ${btn.value === '.' ? '!font-bold' : ''}
              ${btn.type === 'op' ? 'text-[48px] sm:text-[50px] font-light leading-none' : ''}
              ${btn.type === 'func' ? 'text-[34px] sm:text-[36px] font-normal leading-none tracking-tight' : ''}
              ${btn.value === 'AC' ? '!text-[32px] sm:!text-[34px]' : ''}
              ${btn.type === 'equal' ? 'text-[48px] sm:text-[50px] font-normal leading-none' : ''}

              /* Default Num Style */
              bg-[#2D2E36] text-white hover:bg-[#3D3E4A]

              /* Func Style (AC, (), %) */
              ${btn.type === 'func' ? 'bg-[#3F4050] text-[#D2D4E5] hover:bg-[#4F5060]' : ''}
              ${btn.value === 'AC' ? '!bg-[#5B5D85] !text-[#E0E2FF] hover:!bg-[#6B6D95]' : ''}

              /* Op Style (+, -, *, /) */
              ${btn.type === 'op' ? 'bg-[#3F4050] text-[#D2D4E5] hover:bg-[#4F5060]' : ''}

              /* Equal Style */
              ${btn.type === 'equal' ? '!bg-[#FFD1E8] !text-[#2D001F] hover:!bg-[#FFE1F0]' : ''}
              
              /* Backspace Icon */
              ${btn.value === 'BACK' ? 'text-white' : ''}
            `}
            aria-label={btn.label === '⌫' ? 'Borrar carácter' : btn.label}
          >
            {btn.value === 'BACK' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[34px] h-[34px]"
              >
                <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                <line x1="17.5" y1="9" x2="11.5" y2="15" />
                <line x1="11.5" y1="9" x2="17.5" y2="15" />
              </svg>
            ) : (
              btn.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
