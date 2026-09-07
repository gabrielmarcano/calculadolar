import { useState, useRef, useCallback } from 'react';
import { evaluate, format } from 'mathjs';
import { prepareExpressionForEvaluation } from '@/lib/percentage';

const SELECTED_RATES_KEY = 'calculadolar_selected_rates';

interface UseCalculatorLogicOptions {
  rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
}

export function useCalculatorLogic({ rates }: UseCalculatorLogicOptions) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [cursorIndex, setCursorIndexState] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  // Synchronous refs to prevent stale closure race conditions during ultra-fast multi-touch typing
  const inputRef = useRef('');
  const cursorIndexRef = useRef(0);

  // User-selected rates with localStorage persistence
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

  const rateKeys = Object.keys(rates);
  const selectedRates = (() => {
    if (userSelectedRates && userSelectedRates.length > 0) {
      const valid = userSelectedRates.filter((k) => rateKeys.includes(k));
      if (valid.length > 0) return valid;
    }
    return rateKeys.slice(0, 3);
  })();

  const setCursorIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, inputRef.current.length));
      cursorIndexRef.current = clamped;
      setCursorIndexState(clamped);
    },
    []
  );

  const calculateLiveResult = useCallback(
    (expression: string): string => {
      if (!expression) return '';

      const prepared = prepareExpressionForEvaluation(expression);

      try {
        const val = evaluate(prepared);
        if (val === undefined || isNaN(val)) return result;

        const formatted = format(val, { precision: 14 });
        setHasError(false);
        return formatted;
      } catch {
        return result;
      }
    },
    [result]
  );

  const updateInput = useCallback(
    (nextInput: string, nextCursor?: number) => {
      inputRef.current = nextInput;
      setInput(nextInput);
      const newResult = calculateLiveResult(nextInput);
      setResult(newResult);
      const targetCursor = nextCursor !== undefined ? nextCursor : nextInput.length;
      const clamped = Math.max(0, Math.min(targetCursor, nextInput.length));
      cursorIndexRef.current = clamped;
      setCursorIndexState(clamped);
    },
    [calculateLiveResult]
  );

  const handlePercent = useCallback(() => {
    const curInput = inputRef.current;
    const curCursor = cursorIndexRef.current;
    const before = curInput.slice(0, curCursor);
    const after = curInput.slice(curCursor);
    // Allow % only after a digit or closing parenthesis
    if (/[\d)]$/.test(before)) {
      const toInsert = '%';
      const next = before + toInsert + after;
      updateInput(next, curCursor + toInsert.length);
    }
  }, [updateInput]);

  const handleClick = useCallback(
    (value: string) => {
      const curInput = inputRef.current;
      const curCursor = cursorIndexRef.current;

      if (hasError) {
        inputRef.current = value;
        cursorIndexRef.current = value.length;
        setInput(value);
        setCursorIndexState(value.length);
        setHasError(false);
        const newRes = calculateLiveResult(value);
        setResult(newRes);
        return;
      }

      // If expression is '0' or '0.00' and digit is typed at the first position, replace it
      if ((curInput === '0' || curInput === '0.00') && /^\d$/.test(value) && curCursor <= 1) {
        updateInput(value, value.length);
        return;
      }

      // If '0.00' and dot is pressed, set to '0.'
      if (curInput === '0.00' && value === '.') {
        updateInput('0.', 2);
        return;
      }

      if (value === '%') {
        handlePercent();
        return;
      }

      const before = curInput.slice(0, curCursor);
      const after = curInput.slice(curCursor);

      let toInsert = value;
      // If typing a digit or opening paren right after a percentage, auto-insert multiplication
      if (/%$/.test(before) && (/^\d$/.test(value) || value === '(')) {
        toInsert = '×' + value;
      }

      const next = before + toInsert + after;
      const nextPos = curCursor + toInsert.length;
      updateInput(next, nextPos);
    },
    [hasError, calculateLiveResult, updateInput, handlePercent]
  );

  const handleBackspace = useCallback(() => {
    const curInput = inputRef.current;
    const curCursor = cursorIndexRef.current;
    if (curCursor === 0) return;
    const before = curInput.slice(0, curCursor - 1);
    const after = curInput.slice(curCursor);
    const next = before + after;
    const nextPos = curCursor - 1;
    updateInput(next, nextPos);
  }, [updateInput]);

  const handleClear = useCallback(() => {
    inputRef.current = '';
    cursorIndexRef.current = 0;
    setInput('');
    setResult('');
    setCursorIndexState(0);
    setHasError(false);
  }, []);

  const commitResult = useCallback(() => {
    if (!result) return;
    inputRef.current = result;
    cursorIndexRef.current = result.length;
    setInput(result);
    setCursorIndexState(result.length);
  }, [result]);

  const handleParentheses = useCallback(() => {
    const curInput = inputRef.current;
    const curCursor = cursorIndexRef.current;
    const before = curInput.slice(0, curCursor);
    const after = curInput.slice(curCursor);
    const openCount = (curInput.match(/\(/g) || []).length;
    const closeCount = (curInput.match(/\)/g) || []).length;
    const lastChar = before.slice(-1);

    let toInsert = '(';
    if (openCount > closeCount) {
      toInsert = /\d|\)|%/.test(lastChar) ? ')' : '(';
    } else {
      toInsert = /\d|\)|%/.test(lastChar) ? '×(' : '(';
    }

    const next = before + toInsert + after;
    updateInput(next, curCursor + toInsert.length);
  }, [updateInput]);

  const toggleRate = useCallback(
    (currency: string) => {
      const current = selectedRates;
      if (current.includes(currency) && current.length <= 1) {
        return;
      }
      const next = current.includes(currency)
        ? current.filter((c) => c !== currency)
        : [...current, currency];
      setUserSelectedRates(next);
      try {
        localStorage.setItem(SELECTED_RATES_KEY, JSON.stringify(next));
      } catch {}
    },
    [selectedRates]
  );

  const toggleReversed = useCallback(() => {
    setIsReversed((prev) => !prev);
  }, []);

  const numericResult = result ? parseFloat(result) : 0;

  return {
    input,
    result,
    numericResult,
    cursorIndex,
    hasError,
    isReversed,
    selectedRates,
    setCursorIndex,
    updateInput,
    handleClick,
    handleBackspace,
    handleClear,
    commitResult,
    handleParentheses,
    handlePercent,
    toggleRate,
    toggleReversed,
    setIsReversed,
  };
}
