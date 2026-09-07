import { useState, useRef, useEffect } from 'react';
import { evaluate, format } from 'mathjs';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';
import { useLongPressCopy } from '@/hooks/useLongPressCopy';
import Toast from '@/components/Toast';
import { sanitizeClipboardExpression } from '@/lib/sanitizer';
import { copyToClipboard } from '@/lib/clipboard';

const SELECTED_RATES_KEY = 'calculadolar_selected_rates';

interface CalculatorViewProps {
  rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
  isOffline?: boolean;
  onOpenRates?: () => void;
  onBack?: () => void;
}

export default function CalculatorView({ rates, isOffline = false, onOpenRates, onBack }: CalculatorViewProps) {
  const handleOpenRates = onOpenRates || onBack || (() => {});
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  
  // State for user-selected rates (persisted in localStorage)
  const [userSelectedRates, setUserSelectedRates] = useState<string[] | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SELECTED_RATES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return null;
  });
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Pure derivation: automatically adapts as soon as rates arrive from cache/network
  const rateKeys = Object.keys(rates);
  const selectedRates = (() => {
    if (userSelectedRates && userSelectedRates.length > 0) {
      const valid = userSelectedRates.filter(k => rateKeys.includes(k));
      if (valid.length > 0) return valid;
    }
    return rateKeys.slice(0, 3);
  })();

  // Gestures (semantic direct copy for read-only outputs, context menu for input)
  const { bindDirectCopy, bindContextMenu, toastProps, showToast } = useLongPressCopy();

  // Floating Contextual Bubble & Smart Resume Suggestion (Zero permanent UI buttons)
  const [showContextBubble, setShowContextBubble] = useState(false);
  const [showResumeSuggestion, setShowResumeSuggestion] = useState(false);

  // App resume detection (returns from WhatsApp/notes/banking apps)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setShowResumeSuggestion(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Scroll Indicators
  const inputRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
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
    } catch {
      return result;
    }
  };

  const updateInput = (nextInput: string) => {
    setInput(nextInput);
    const newResult = calculateLiveResult(nextInput);
    setResult(newResult);
  };

  const dismissContextMenus = () => {
    setShowContextBubble(false);
    setShowResumeSuggestion(false);
  };

  const handlePasteFromClipboard = async () => {
    triggerHaptic();
    dismissContextMenus();

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
        showToast('Pegar requiere HTTPS (o localhost en este equipo)');
        return;
      }

      const text = await navigator.clipboard.readText();
      const sanitized = sanitizeClipboardExpression(text);

      if (!sanitized.isValid) {
        showToast(sanitized.error || 'No se encontró una cuenta o monto válido');
        return;
      }

      // Si el texto pegado empieza con operador (+, -, ×, ÷), concatenar a la cuenta actual
      // Si la cuenta actual está vacía o es '0', o no empieza con operador: reemplazar
      const isOperatorStart = /^[+\-×÷]/.test(sanitized.displayExpression);
      if (input && input !== '0' && isOperatorStart) {
        updateInput(input + sanitized.displayExpression);
      } else {
        updateInput(sanitized.displayExpression);
      }

      if (sanitized.previewValue !== null) {
        showToast(`Pegado: ${sanitized.displayExpression}`);
      } else {
        showToast(`Monto pegado: ${sanitized.displayExpression}`);
      }
    } catch (err) {
      console.error('Clipboard read error:', err);
      showToast('Permiso de portapapeles no concedido');
    }
  };

  const handleCopyInput = () => {
    triggerHaptic();
    dismissContextMenus();
    const toCopy = input || '0';
    copyToClipboard(toCopy).finally(() => {
      showToast('Cuenta copiada');
    });
  };

  const handleClick = (value: string) => {
    dismissContextMenus();
    if (hasError) {
      updateInput(value);
      setHasError(false);
      return;
    }
    // Si la entrada actual es '0' o '0.00' y se introduce un dígito (no un punto ni operador), reemplazar
    if ((input === '0' || input === '0.00') && /^\d$/.test(value)) {
      updateInput(value);
      return;
    }
    // Si la entrada es '0.00' y se pulsa punto, reiniciar a '0.'
    if (input === '0.00' && value === '.') {
      updateInput('0.');
      return;
    }
    updateInput(input + value);
  };

  const handleBackspace = () => {
    dismissContextMenus();
    const next = input.slice(0, -1);
    updateInput(next);
  };

  const clear = () => {
    dismissContextMenus();
    setInput('');
    setResult('');
    setHasError(false);
  };

  const commitResult = () => {
    dismissContextMenus();
    if (!result) return;
    setInput(result);
  };
  
  const toggleRate = (currency: string) => {
    const current = selectedRates;
    const next = current.includes(currency) 
      ? current.filter(c => c !== currency) 
      : [...current, currency];
    setUserSelectedRates(next);
    try {
      localStorage.setItem(SELECTED_RATES_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleParentheses = () => {
      const openCount = (input.match(/\(/g) || []).length;
      const closeCount = (input.match(/\)/g) || []).length;
      
      if (openCount > closeCount) {
          const lastChar = input.slice(-1);
          if (/\d|\)/.test(lastChar)) {
              updateInput(input + ')');
          } else {
              updateInput(input + '(');
          }
      } else {
          const lastChar = input.slice(-1);
          if (/\d|\)/.test(lastChar)) {
              updateInput(input + '*(');
          } else {
              updateInput(input + '(');
          }
      }
  };

  const handlePercent = () => {
      // Basic implementation: divide last number by 100
      // For now, simply appending '/100' works mathematically but might look messy.
      // Better: if input ends in number, append '/100'.
      if (/\d$/.test(input)) {
          updateInput(input + '/100');
      }
  };

  // Layout based on image provided (4x5 grid)
  const buttons = [
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
    { label: '⌫', value: 'BACK', type: 'num' }, // Using num style or maybe distinct? Image shows dark like nums
    { label: '=', value: '=', type: 'equal' },
  ];

  const numericResult = result ? parseFloat(result) : 0;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white font-sans">
      
      {/* Top Bar / Rate Selector */}
      <div className={`flex-none flex justify-between items-center p-4 relative ${isSelectorOpen ? 'z-40' : 'z-10'}`}>
        <div className="flex items-center gap-2">
            <button
                onClick={() => {
                    triggerHaptic();
                    handleOpenRates();
                }}
                className="flex items-center gap-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-200 text-xs font-bold py-2 px-3 rounded-full transition-all active:scale-95 border border-white/5 shadow-sm"
                title="Ver tasas de cambio"
                aria-label="Ver tasas de cambio"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-400">
                  <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-5 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm-5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm14-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM4 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
                </svg>
                <span>Tasas</span>
                {isOffline && (
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse ml-0.5" title="Modo sin conexión" />
                )}
            </button>
            <div className="relative flex bg-[#2d2d2d] rounded-full p-[3px]">
                <div
                    className="absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] bg-[#4a4a5a] rounded-full transition-all duration-300 ease-in-out"
                    style={{ left: isReversed ? 'calc(50%)' : '3px' }}
                />
                <button
                    onClick={() => {
                        triggerHaptic();
                        setIsReversed(false);
                    }}
                    className={`relative z-10 text-xs font-bold py-1.5 px-3.5 rounded-full transition-colors duration-300 ${
                        !isReversed ? 'text-white' : 'text-gray-500'
                    }`}
                >
                    USD
                </button>
                <button
                    onClick={() => {
                        triggerHaptic();
                        setIsReversed(true);
                    }}
                    className={`relative z-10 text-xs font-bold py-1.5 px-3.5 rounded-full transition-colors duration-300 ${
                        isReversed ? 'text-white' : 'text-gray-500'
                    }`}
                >
                    VES
                </button>
            </div>
        </div>
        <div className="relative">
            <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white text-xs font-bold py-2 px-4 rounded-full transition-all"
            >
                <span>{`${selectedRates.length} Precio${selectedRates.length === 1 ? '' : 's'} Activo${selectedRates.length === 1 ? '' : 's'}`}</span>
                <span className={`transform transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {isSelectorOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-black/50" 
                        onClick={() => setIsSelectorOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-800 p-2 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {Object.keys(rates).length === 0 ? (
                            <div className="text-gray-500 text-xs text-center py-2">No rates available</div>
                        ) : (
                            Object.keys(rates).map(currency => {
                                const isSelected = selectedRates.includes(currency);
                                const rate = rates[currency];
                                return (
                                    <button
                                        key={currency}
                                        onClick={() => {
                                            triggerHaptic();
                                            toggleRate(currency);
                                        }}
                                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium mb-1 transition-colors ${
                                            isSelected 
                                            ? 'bg-blue-600/20 text-blue-400' 
                                             : 'text-gray-300 hover:bg-[#2d2d2d]'
                                        }`}
                                    >
                                        {rate.imageUrl && (
                                            <Image src={rate.imageUrl} alt={rate.displayName} width={20} height={20} className="w-5 h-5 rounded-full bg-white object-contain p-0.5" />
                                        )}
                                        <span className="flex-1">{rate.displayName}</span>
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

      {/* Screen / Display Area (Fixed/Auto Height - Always Visible) */}
      <div className="flex-none flex flex-col justify-end pt-3 px-6 pb-4 space-y-4 relative z-20">
        
        {/* 1. User Input (Scrollable) */}
        <div className="w-full relative group">
             {/* Smart Resume Suggestion (Appears when returning from another app) */}
             {showResumeSuggestion && (
                 <div className="absolute -top-9 right-0 z-30 flex items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                     <button
                         onClick={handlePasteFromClipboard}
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
                                 setShowResumeSuggestion(false);
                             }}
                             className="text-gray-400 hover:text-gray-200 ml-1.5 p-1 -mr-1 rounded-full hover:bg-white/10 active:scale-90 transition-transform flex items-center justify-center min-w-[28px] min-h-[28px]"
                             aria-label="Cerrar sugerencia"
                         >
                             ✕
                         </button>
                     </button>
                 </div>
             )}

             {/* Contextual Action Bubble (Triggered on long-press on display) */}
             {showContextBubble && (
                 <div className="absolute -top-9 right-0 z-30 flex items-center bg-[#252525] border border-white/15 rounded-full shadow-2xl overflow-hidden py-0.5 px-1 animate-in zoom-in-95 duration-150">
                     {input && input !== '0' && (
                         <button
                             onClick={handleCopyInput}
                             className="px-3 py-1 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
                         >
                             Copiar
                         </button>
                     )}
                     {input && input !== '0' && <div className="w-[1px] h-3 bg-white/20 my-auto" />}
                     <button
                         onClick={handlePasteFromClipboard}
                         className="px-3 py-1 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95 flex items-center gap-1"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-400">
                           <path fillRule="evenodd" d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.5A2.5 2.5 0 0 1 14.5 19h-9A2.5 2.5 0 0 1 3 16.5V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 0 1 9 1h2c1.373 0 2.531.923 2.887 2.182ZM7.5 4A1.5 1.5 0 0 1 9 2.5h2A1.5 1.5 0 0 1 12.5 4v.5h-5V4Z" clipRule="evenodd" />
                         </svg>
                         <span>Pegar</span>
                     </button>
                 </div>
             )}

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
                {...bindContextMenu({
                  onLongPress: () => {
                    setShowContextBubble(true);
                    setShowResumeSuggestion(false);
                  },
                  onTap: () => {
                    dismissContextMenus();
                  },
                })}
                className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide text-right text-3xl font-light tracking-wide text-gray-300 cursor-pointer active:opacity-80 transition-opacity tabular-nums"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
             >
                {input || '0'}
             </div>

             {canScrollRight && (
                 <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-gradient-to-l from-[#121212] to-transparent pl-4 z-10 pointer-events-none">
                     <span className="text-gray-500 text-xl font-bold">›</span>
                 </div>
             )}
        </div>

        {/* 2. Main Result */}
        <div className="w-full text-right flex items-center justify-end gap-3">
             <div
                {...bindDirectCopy(
                  result && parseFloat(result) !== 0 ? parseFloat(result).toFixed(2) : '0',
                  result && parseFloat(result) !== 0 ? parseFloat(result).toFixed(2) : '0',
                  {
                    onTap: commitResult,
                  }
                )}
                className="text-5xl sm:text-6xl font-normal tracking-tight text-white break-all line-clamp-1 cursor-pointer tabular-nums"
             >
                = {isReversed ? 'Bs' : '$'} {result && parseFloat(result) !== 0 ? parseFloat(result).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'}
             </div>
        </div>
        
        {/* Rate Results - Fixed Height to prevent keypad jumps */}
        <div className="w-full h-[142px] space-y-1.5 overflow-y-auto flex-shrink-0 pt-2 border-t border-gray-800/50 scrollbar-hide">
                {selectedRates.length > 0 && Object.keys(rates).filter(k => selectedRates.includes(k)).map(currency => {
                const rate = rates[currency]?.price || 0;
                const displayName = rates[currency]?.displayName || currency;
                const imageUrl = rates[currency]?.imageUrl;
                const converted = isReversed
                    ? (rate > 0 ? numericResult / rate : 0)
                    : numericResult * rate;
                const isZero = numericResult === 0 || converted === 0;
                const currencySymbol = currency.toLowerCase().includes('eur') ? '€' : '$';
                const suffix = isReversed ? ` ${currencySymbol}` : ' Bs';
                const convertedStr = isZero ? '0' : converted.toFixed(2);
                const formattedValue = isZero
                    ? '0'
                    : converted.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                const copyValue = isZero ? '0' : converted.toFixed(2);
                return (
                    <div
                        key={currency}
                        {...bindDirectCopy(copyValue, `${displayName}: ${copyValue}`, {
                            onTap: () => {
                                triggerHaptic();
                                setIsReversed(prev => !prev);
                                if (!isZero) {
                                    updateInput(convertedStr);
                                } else {
                                    updateInput('0');
                                }
                            },
                            touchAction: 'pan-y',
                        })}
                        className="flex justify-between items-center text-sm text-gray-400 py-1 rounded-lg px-2 -mx-2 min-h-[34px] cursor-pointer hover:bg-[#1a1a1a] active:scale-[0.98] active:bg-[#1e1e1e] transition-all"
                    >
                        <div className="flex items-center gap-2">
                            {imageUrl && (
                                <Image src={imageUrl} alt={displayName} width={16} height={16} className="w-4 h-4 rounded-full bg-white object-contain p-[1px] mb-0.5" />
                            )}
                            <span className="font-medium">{displayName}</span>
                        </div>
                        <span className="text-white font-mono tabular-nums text-lg">{formattedValue}{suffix}</span>
                    </div>
                )
                })}
        </div>
      </div>

      {/* Keypad */}
      {/* Keypad (Flexible - Fills remaining space with subtle top breathing room) */}
      <div className="flex-1 min-h-0 px-4 pt-3 pb-4 bg-[#0a0a0a]">
        <div className="h-full w-full grid grid-cols-4 grid-rows-5 gap-2 sm:gap-2.5">
            {buttons.map((btn) => (
            <button
                key={btn.label}
                onClick={() => {
                    triggerHaptic();
                    if (btn.value === 'AC') clear();
                    else if (btn.value === 'BACK') handleBackspace();
                    else if (btn.value === '=') commitResult();
                    else if (btn.value === '()') handleParentheses();
                    else if (btn.value === '%') handlePercent();
                    else handleClick(btn.value);
                }}
                className={`
                h-full w-full rounded-[2rem] sm:rounded-[2.5rem] transition-all active:scale-95 flex items-center justify-center
                
                /* Typography Scale: Numbers/Point/Back remain calibrated, outer perimeter buttons enlarged */
                ${btn.type === 'num' ? 'text-[38px] sm:text-[40px] font-normal leading-none' : ''}
                ${btn.value === '.' ? '!font-bold' : ''}
                ${btn.type === 'op' ? 'text-[42px] sm:text-[44px] font-light leading-none' : ''}
                ${btn.type === 'func' ? 'text-[30px] sm:text-[32px] font-normal leading-none' : ''}
                ${btn.type === 'equal' ? 'text-[42px] sm:text-[44px] font-normal leading-none' : ''}

                /* Default Num Style */
                bg-[#2D2E36] text-white hover:bg-[#3D3E4A]

                /* Func Style (AC, (), %) - Muted/Dark or Purple for AC */
                ${btn.type === 'func' ? 'bg-[#3F4050] text-white hover:bg-[#4F5060]' : ''}
                ${btn.value === 'AC' ? '!bg-[#5B5D85] text-white hover:!bg-[#6B6D95]' : ''}

                /* Op Style (+, -, *, /) */
                ${btn.type === 'op' ? 'bg-[#3F4050] text-white hover:bg-[#4F5060]' : ''}

                /* Equal Style */
                ${btn.type === 'equal' ? '!bg-[#FFD1E8] !text-black hover:!bg-[#FFE1F0]' : ''}
                
                /* Backspace Icon */
                ${btn.value === 'BACK' ? 'text-white' : ''}
                `}
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
                ) : btn.label}
            </button>
            ))}
        </div>
      </div>

      <Toast {...toastProps} />
    </div>
  );
}
