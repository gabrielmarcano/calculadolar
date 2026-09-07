import { useState, useCallback } from 'react';
import { evaluate, format } from 'mathjs';

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
      setCursorIndexState(Math.max(0, Math.min(index, input.length)));
    },
    [input.length]
  );

  const calculateLiveResult = useCallback(
    (expression: string): string => {
      if (!expression) return '';

      const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');

      try {
        const val = evaluate(sanitized);
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
      setInput(nextInput);
      const newResult = calculateLiveResult(nextInput);
      setResult(newResult);
      const targetCursor = nextCursor !== undefined ? nextCursor : nextInput.length;
      setCursorIndexState(Math.max(0, Math.min(targetCursor, nextInput.length)));
    },
    [calculateLiveResult]
  );

  const handleClick = useCallback(
    (value: string) => {
      if (hasError) {
        setInput(value);
        setCursorIndexState(value.length);
        setHasError(false);
        const newRes = calculateLiveResult(value);
        setResult(newRes);
        return;
      }

      // If expression is '0' or '0.00' and digit is typed at the first position, replace it
      if ((input === '0' || input === '0.00') && /^\d$/.test(value) && cursorIndex <= 1) {
        updateInput(value, value.length);
        return;
      }

      // If '0.00' and dot is pressed, set to '0.'
      if (input === '0.00' && value === '.') {
        updateInput('0.', 2);
        return;
      }

      const before = input.slice(0, cursorIndex);
      const after = input.slice(cursorIndex);
      const next = before + value + after;
      const nextPos = cursorIndex + value.length;
      updateInput(next, nextPos);
    },
    [hasError, input, cursorIndex, calculateLiveResult, updateInput]
  );

  const handleBackspace = useCallback(() => {
    if (cursorIndex === 0) return;
    const before = input.slice(0, cursorIndex - 1);
    const after = input.slice(cursorIndex);
    const next = before + after;
    const nextPos = cursorIndex - 1;
    updateInput(next, nextPos);
  }, [input, cursorIndex, updateInput]);

  const handleClear = useCallback(() => {
    setInput('');
    setResult('');
    setCursorIndexState(0);
    setHasError(false);
  }, []);

  const commitResult = useCallback(() => {
    if (!result) return;
    setInput(result);
    setCursorIndexState(result.length);
  }, [result]);

  const handleParentheses = useCallback(() => {
    const before = input.slice(0, cursorIndex);
    const after = input.slice(cursorIndex);
    const openCount = (input.match(/\(/g) || []).length;
    const closeCount = (input.match(/\)/g) || []).length;
    const lastChar = before.slice(-1);

    let toInsert = '(';
    if (openCount > closeCount) {
      toInsert = /\d|\)/.test(lastChar) ? ')' : '(';
    } else {
      toInsert = /\d|\)/.test(lastChar) ? '*(' : '(';
    }

    const next = before + toInsert + after;
    updateInput(next, cursorIndex + toInsert.length);
  }, [input, cursorIndex, updateInput]);

  const handlePercent = useCallback(() => {
    const before = input.slice(0, cursorIndex);
    const after = input.slice(cursorIndex);
    if (/\d$/.test(before)) {
      const toInsert = '/100';
      const next = before + toInsert + after;
      updateInput(next, cursorIndex + toInsert.length);
    }
  }, [input, cursorIndex, updateInput]);

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
