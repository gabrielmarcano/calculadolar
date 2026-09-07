import React, { useState, useRef, useEffect, useCallback } from 'react';
import { triggerHaptic } from '@/lib/utils';
import { copyToClipboard } from '@/lib/clipboard';
import { sanitizeClipboardExpression } from '@/lib/sanitizer';
import CalculatorContextBubble from '@/components/CalculatorContextBubble';

interface CalculatorDisplayProps {
  input: string;
  result: string;
  cursorIndex: number;
  isReversed: boolean;
  onTapCursorPosition: (index: number) => void;
  onCommitResult: () => void;
  onUpdateInput: (nextInput: string, nextCursor?: number) => void;
  showToast: (msg: string) => void;
}

export default function CalculatorDisplay({
  input,
  result,
  cursorIndex,
  isReversed,
  onTapCursorPosition,
  onCommitResult,
  onUpdateInput,
  showToast,
}: CalculatorDisplayProps) {
  const [showContextBubble, setShowContextBubble] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const inputScrollRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number; hasMoved: boolean } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressRef = useRef(false);

  // Check scroll indicators
  const checkScroll = useCallback(() => {
    const el = inputScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 2);
  }, []);

  // Auto-scroll to ensure cursor is visible when cursorIndex or input changes
  useEffect(() => {
    checkScroll();
    if (caretRef.current) {
      caretRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  }, [cursorIndex, input, checkScroll]);

  const dismissContextBubble = useCallback(() => {
    setShowContextBubble(false);
  }, []);

  // Auto-dismiss context bubble on any outside tap/touch anywhere on screen
  useEffect(() => {
    if (!showContextBubble) return;
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-context-bubble]')) {
        setShowContextBubble(false);
      }
    };
    window.addEventListener('pointerdown', handleGlobalPointerDown, true);
    return () => window.removeEventListener('pointerdown', handleGlobalPointerDown, true);
  }, [showContextBubble]);

  // Auto-dismiss context bubble when input changes (typing any digit or function)
  const [prevInput, setPrevInput] = useState(input);
  if (prevInput !== input) {
    setPrevInput(input);
    if (showContextBubble) {
      setShowContextBubble(false);
    }
  }

  const calculateAndSetCursor = (clientX: number) => {
    const container = inputScrollRef.current;
    if (!container || input.length === 0) {
      onTapCursorPosition(0);
      return;
    }

    const charSpans = Array.from(container.querySelectorAll<HTMLElement>('[data-char-idx]'));
    if (charSpans.length === 0) {
      onTapCursorPosition(0);
      return;
    }

    const firstRect = charSpans[0].getBoundingClientRect();
    const lastRect = charSpans[charSpans.length - 1].getBoundingClientRect();

    if (clientX < firstRect.left) {
      onTapCursorPosition(0);
      return;
    }
    if (clientX > lastRect.right) {
      onTapCursorPosition(input.length);
      return;
    }

    // Direct hit on character bounds
    for (let i = 0; i < charSpans.length; i++) {
      const rect = charSpans[i].getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        const mid = rect.left + rect.width / 2;
        onTapCursorPosition(clientX < mid ? i : i + 1);
        return;
      }
    }

    // Nearest span fallback
    let closestIdx = 0;
    let minDistance = Infinity;
    for (let i = 0; i < charSpans.length; i++) {
      const rect = charSpans[i].getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const dist = Math.abs(clientX - mid);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = clientX < mid ? i : i + 1;
      }
    }
    onTapCursorPosition(closestIdx);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    wasLongPressRef.current = false;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      hasMoved: false,
    };

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      wasLongPressRef.current = true;
      triggerHaptic();
      setShowContextBubble(true);
    }, 450);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerStartRef.current) {
      const dx = Math.abs(e.clientX - pointerStartRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartRef.current.y);
      if (dx > 8 || dy > 8) {
        pointerStartRef.current.hasMoved = true;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    if (start.hasMoved) {
      return;
    }

    if (wasLongPressRef.current) {
      wasLongPressRef.current = false;
      return;
    }

    // Clean tap: dismiss bubble if open, reposition cursor
    dismissContextBubble();
    triggerHaptic();
    calculateAndSetCursor(e.clientX);
  };

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pointerStartRef.current = null;
    wasLongPressRef.current = false;
  };

  const handlePasteFromClipboard = async () => {
    triggerHaptic();
    dismissContextBubble();

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

      const isOperatorStart = /^[+\-×÷]/.test(sanitized.displayExpression);
      if (input && input !== '0' && isOperatorStart) {
        const before = input.slice(0, cursorIndex);
        const after = input.slice(cursorIndex);
        const next = before + sanitized.displayExpression + after;
        onUpdateInput(next, cursorIndex + sanitized.displayExpression.length);
      } else {
        onUpdateInput(sanitized.displayExpression, sanitized.displayExpression.length);
      }

      showToast(`Pegado: ${sanitized.displayExpression}`);
    } catch {
      showToast('Permiso de portapapeles no concedido');
    }
  };

  const handleCopyInput = () => {
    triggerHaptic();
    dismissContextBubble();
    const toCopy = input || '0';
    copyToClipboard(toCopy).finally(() => {
      showToast('Cuenta copiada');
    });
  };

  const handleCopyResult = () => {
    triggerHaptic();
    const val = result && parseFloat(result) !== 0 ? parseFloat(result).toFixed(2) : '0';
    copyToClipboard(val).finally(() => {
      showToast('Resultado copiado');
    });
  };

  const characters = input.split('');

  return (
    <div className="w-full flex flex-col justify-end space-y-4">
      {/* 1. Interactive Expression Panel with Blinking Caret */}
      <div className="w-full relative group">
        <CalculatorContextBubble
          isOpen={showContextBubble}
          input={input}
          onPaste={handlePasteFromClipboard}
          onCopy={handleCopyInput}
        />

        {/* Scroll Indicators */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-gradient-to-r from-[#121212] to-transparent pr-4 z-10 pointer-events-none">
            <span className="text-gray-500 text-xl font-bold">‹</span>
          </div>
        )}

        {/* Input Text / Interactive Visor */}
        <div
          ref={inputScrollRef}
          data-no-swipe="true"
          onScroll={checkScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="w-full min-h-[58px] flex items-center justify-end overflow-x-auto whitespace-nowrap scrollbar-hide text-right text-3xl sm:text-4xl font-light tracking-wide text-gray-200 cursor-text select-none tabular-nums touch-pan-x py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {characters.length === 0 ? (
            <span className="inline-flex items-center h-full">
              <span className="text-gray-600 select-none mr-0.5">0</span>
              <span
                ref={caretRef}
                className="inline-block w-[2.5px] h-[0.95em] bg-sky-400 rounded-full align-middle animate-cursor-blink pointer-events-none shadow-[0_0_8px_rgba(56,189,248,0.5)]"
              />
            </span>
          ) : (
            <span className="inline-flex items-center h-full">
              {characters.map((char, idx) => (
                <span key={idx} className="inline-flex items-center">
                  {idx === cursorIndex && (
                    <span
                      ref={caretRef}
                      className="inline-block w-[2.5px] h-[0.95em] bg-sky-400 rounded-full align-middle mx-[0.5px] animate-cursor-blink pointer-events-none shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                    />
                  )}
                  <span data-char-idx={idx} className="inline-block py-0.5">
                    {char}
                  </span>
                </span>
              ))}
              {cursorIndex >= characters.length && (
                <span
                  ref={caretRef}
                  className="inline-block w-[2.5px] h-[0.95em] bg-sky-400 rounded-full align-middle mx-[0.5px] animate-cursor-blink pointer-events-none shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                />
              )}
            </span>
          )}
        </div>

        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-gradient-to-l from-[#121212] to-transparent pl-4 z-10 pointer-events-none">
            <span className="text-gray-500 text-xl font-bold">›</span>
          </div>
        )}
      </div>

      {/* 2. Main Result Line */}
      <div className="w-full text-right flex items-center justify-end min-h-[72px]">
        <div
          onClick={() => {
            triggerHaptic();
            onCommitResult();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            handleCopyResult();
          }}
          className="text-5xl sm:text-6xl font-normal tracking-tight text-white break-all line-clamp-1 cursor-pointer select-none tabular-nums active:opacity-80 transition-opacity"
          title="Toca para usar resultado, mantén presionado para copiar"
        >
          = {isReversed ? 'Bs' : '$'}{' '}
          {result && parseFloat(result) !== 0
            ? parseFloat(result).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '0'}
        </div>
      </div>
    </div>
  );
}
