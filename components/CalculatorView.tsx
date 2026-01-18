import { useState, useMemo, useRef, useEffect } from 'react';
import { evaluate, format } from 'mathjs';

interface CalculatorViewProps {
  rates: Record<string, { price: number; displayName: string }>;
}

export default function CalculatorView({ rates }: CalculatorViewProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [hasError, setHasError] = useState(false);
  
  // State for selected rates to show conversions for
  const [selectedRates, setSelectedRates] = useState<string[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Scroll Indicators
  const inputRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Initialize selected rates
  useMemo(() => {
    if (selectedRates.length === 0 && Object.keys(rates).length > 0) {
        // Default to showing first 3 rates
        setSelectedRates(Object.keys(rates).slice(0, 3)); 
    }
  }, [rates]);
  
  // Scroll Logic
  const checkScroll = () => {
      const el = inputRef.current;
      if (!el) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Precision buffer
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
  };

  useEffect(() => {
      checkScroll();
      // Auto-scroll to end on input change
      if (inputRef.current) {
          inputRef.current.scrollLeft = inputRef.current.scrollWidth;
      }
  }, [input]);

  // --- LOGIC ---
  const isOperator = (char: string) => ['/', '*', '-', '+', '.', '(', ')'].includes(char);

  const calculateLiveResult = (expression: string) => {
    if (!expression) return '';
    
    // Replace visual operators with math operators
    const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

    try {
      const val = evaluate(sanitized);
      if (val === undefined || isNaN(val)) return result;
      
      const formatted = format(val, { precision: 14 });
      setHasError(false);
      return formatted;
    } catch (e) {
      return result;
    }
  };

  const updateInput = (nextInput: string) => {
    setInput(nextInput);
    const newResult = calculateLiveResult(nextInput);
    setResult(newResult);
  };

  const handleClick = (value: string) => {
    if (hasError) {
      updateInput(value);
      setHasError(false);
      return;
    }
    updateInput(input + value);
  };

  const handleBackspace = () => {
      const next = input.slice(0, -1);
      updateInput(next);
  }

  const clear = () => {
    setInput('');
    setResult('');
    setHasError(false);
  };

  const commitResult = () => {
    if (!result) return;
    setInput(result);
  };
  
  const toggleRate = (currency: string) => {
      setSelectedRates(prev => 
          prev.includes(currency) 
          ? prev.filter(c => c !== currency) 
          : [...prev, currency]
      );
  };

  // Layout based on image
  const buttons = [
    { label: 'C', value: 'C', type: 'secondary' },
    { label: '(', value: '(', type: 'secondary' },
    { label: ')', value: ')', type: 'secondary' },
    { label: '÷', value: '÷', type: 'secondary' },
    { label: '7', value: '7', type: 'num' },
    { label: '8', value: '8', type: 'num' },
    { label: '9', value: '9', type: 'num' },
    { label: '×', value: '×', type: 'secondary' },
    { label: '4', value: '4', type: 'num' },
    { label: '5', value: '5', type: 'num' },
    { label: '6', value: '6', type: 'num' },
    { label: '-', value: '-', type: 'secondary' },
    { label: '1', value: '1', type: 'num' },
    { label: '2', value: '2', type: 'num' },
    { label: '3', value: '3', type: 'num' },
    { label: '+', value: '+', type: 'secondary' },
    { label: '0', value: '0', type: 'num', span: 2 },
    { label: ',', value: '.', type: 'num' },
    { label: '=', value: '=', type: 'accent' },
  ];

  const numericResult = result ? parseFloat(result) : 0;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white rounded-3xl overflow-hidden font-sans">
      
      {/* Top Bar / Rate Selector */}
      <div className="flex-none flex justify-between items-center p-4 relative z-20">
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          Active Rates
        </label>
        <div className="relative">
            <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white text-xs font-bold py-2 px-4 rounded-full transition-all"
            >
                <span>{selectedRates.length} Selected</span>
                <span className={`transform transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {isSelectorOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10 bg-black/50" 
                        onClick={() => setIsSelectorOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-800 p-2 z-20 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {Object.keys(rates).length === 0 ? (
                            <div className="text-gray-500 text-xs text-center py-2">No rates available</div>
                        ) : (
                            Object.keys(rates).map(currency => {
                                const isSelected = selectedRates.includes(currency);
                                return (
                                    <button
                                        key={currency}
                                        onClick={() => toggleRate(currency)}
                                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium mb-1 transition-colors ${
                                            isSelected 
                                            ? 'bg-blue-600/20 text-blue-400' 
                                            : 'text-gray-300 hover:bg-[#2d2d2d]'
                                        }`}
                                    >
                                        <span>{rates[currency].displayName}</span>
                                        {isSelected && <span>✓</span>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Screen / Display Area */}
      <div className="flex-1 min-h-0 flex flex-col justify-end px-6 pb-6 space-y-4 relative z-0">
        
        {/* 1. User Input (Scrollable) */}
        <div className="w-full relative group">
             {/* Indicators */}
             {canScrollLeft && (
                 <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-gradient-to-r from-[#121212] to-transparent pr-4 z-10 pointer-events-none">
                     <span className="text-gray-500 text-xl font-bold">‹</span>
                 </div>
             )}
             
             {/* Input Text */}
             <div 
                ref={inputRef}
                onScroll={checkScroll}
                className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide text-right text-3xl font-light tracking-wide text-gray-300"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
             >
                {input || '0'}
             </div>

             {canScrollRight && (
                 <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-gradient-to-l from-[#121212] to-transparent pl-4 z-10 pointer-events-none">
                     <span className="text-gray-500 text-xl font-bold">›</span>
                 </div>
             )}

             {/* Backspace Absolute Trigger (Invisible overlay handled by UI? No, explicit button better) */}
        </div>

        {/* 2. Main Result */}
        <div className="w-full text-right flex items-center justify-end gap-3">
             <div className="text-5xl sm:text-6xl font-normal tracking-tight text-white break-all line-clamp-1">
                = {result ? parseFloat(result).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'}
             </div>
             
             {/* Floating Backspace Button nicely integrated */}
             {input && (
                <button 
                  onClick={handleBackspace}
                  className="text-gray-500 hover:text-white p-2 bg-[#1e1e1e] rounded-full transition-colors active:scale-95"
                  aria-label="Backspace"
                >
                   ⌫
                </button>
             )}
        </div>
        
        {/* 3. Multi-Currency Results */}
        {!isSelectorOpen && selectedRates.length > 0 && (
            <div className="w-full space-y-2 overflow-y-auto flex-shrink min-h-0 pt-2 border-t border-gray-800/50">
                 {selectedRates.map(currency => {
                    const rate = rates[currency]?.price || 0;
                    const displayName = rates[currency]?.displayName || currency;
                    const converted = numericResult * rate;
                    return (
                        <div key={currency} className="flex justify-between items-end text-sm text-gray-400 pb-1">
                            <span className="font-medium">{displayName}</span>
                            <span className="text-white font-mono text-lg">{converted.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                        </div>
                    )
                 })}
            </div>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3 p-4 bg-[#121212] flex-none">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => {
                if (btn.value === 'C') clear();
                else if (btn.value === '=') commitResult();
                else handleClick(btn.value);
            }}
            className={`
              h-14 sm:h-16 rounded-2xl text-2xl font-medium transition-all active:scale-95 flex items-center justify-center
              ${btn.span === 2 ? 'col-span-2' : ''}
              ${btn.type === 'accent' 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : btn.type === 'secondary'
                    ? 'bg-[#2d2d2d] text-[#3399ff] hover:bg-[#3d3d3d]'
                   : 'bg-[#2d2d2d] text-white hover:bg-[#3d3d3d]'
              }
              ${btn.type === 'secondary' ? 'bg-[#1e1e1e] text-green-500' : ''} 
              ${btn.value === 'C' || btn.value === '(' || btn.value === ')' ? 'text-red-400' : ''}
              ${['÷', '×', '-', '+'].includes(btn.label) ? 'text-green-500 bg-[#1e1e1e]' : ''} 
              ${btn.type === 'num' ? 'bg-[#2d2d2d]' : ''}
              ${btn.type === 'accent' ? '!bg-white !text-black' : ''}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
