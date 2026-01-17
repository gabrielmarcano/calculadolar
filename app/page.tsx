/// <reference lib="dom" />

'use client';

import { useState, ChangeEvent } from 'react';
import { evaluate, format } from 'mathjs';

const RATES: Record<string, number> = {
  EUR: 0.92,
  GBP: 0.79,
  JPY: 148.2,
  CAD: 1.35,
};

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [hasError, setHasError] = useState(false);

  // Helper: Checks if a character is a math operator
  const isOperator = (char: string) => ['/', '*', '-', '+', '.'].includes(char);

  // 1. FIXED: Logic moved from useEffect to here
  // Calculates the result based on a string string immediately
  const calculateLiveResult = (expression: string) => {
    if (!expression) return '';

    // Don't calculate if the expression ends with an operator (e.g. "2 +")
    const lastChar = expression.slice(-1);
    if (isOperator(lastChar)) return result; // Keep old result

    try {
      const val = evaluate(expression);
      const formatted = format(val, { precision: 14 });
      setHasError(false);
      return formatted;
    } catch (e) {
      // Return current result if calculation fails (don't show error yet)
      console.error('Calculation error:', e);
      return result;
    }
  };

  // 2. UPDATED: Central function to update input and trigger calculation
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

    // Logic to reset if typing after a result (optional, depends on preference)
    // If we just committed a result, we might want to append or start fresh
    // For now, we just append to whatever is in 'input'

    // Prevent double operators
    if (isOperator(value) && isOperator(input.slice(-1))) {
      const replacedInput = input.slice(0, -1) + value;
      updateInput(replacedInput);
      return;
    }

    const nextInput = input + value;
    updateInput(nextInput);
  };

  const clear = () => {
    setInput('');
    setResult('');
    setHasError(false);
  };

  const commitResult = () => {
    if (!result) return;
    setInput(result); // Move result to input
    // Result stays visible
  };

  const handleConvert = () => {
    const currentVal = result
      ? parseFloat(result)
      : input
      ? evaluate(input)
      : 0;

    if (isNaN(currentVal)) return;

    const rate = RATES[targetCurrency];
    const converted = currentVal * rate;
    const finalString = converted.toFixed(2);

    // Update both input and result to show the converted value
    setInput(finalString);
    setResult(`${targetCurrency} ${finalString}`);
  };

  const handleCurrencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTargetCurrency(e.target.value);
  };

  const buttons = [
    '7',
    '8',
    '9',
    '/',
    '4',
    '5',
    '6',
    '*',
    '1',
    '2',
    '3',
    '-',
    '0',
    '.',
    '=',
    '+',
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 select-none">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Conversion</h1>
          <select
            value={targetCurrency}
            onChange={handleCurrencyChange}
            className="bg-gray-100 text-sm font-semibold text-gray-700 py-1 px-2 rounded border border-gray-300 outline-none focus:border-blue-500"
          >
            {Object.keys(RATES).map((currency) => (
              <option key={currency} value={currency}>
                USD → {currency}
              </option>
            ))}
          </select>
        </div>

        {/* Display Area */}
        <div className="mb-4 flex flex-col justify-end rounded-lg bg-gray-900 p-4 text-right text-white h-28">
          <div className="text-sm text-gray-400 h-6 overflow-hidden">
            {input || ' '}
          </div>
          <div
            className={`text-3xl font-bold overflow-hidden text-ellipsis ${
              hasError ? 'text-red-400' : ''
            }`}
          >
            {result || '0'}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1">
          <button
            onClick={handleConvert}
            className="w-full rounded-lg bg-green-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:translate-y-0.5 transition-all"
          >
            CONVERT TO {targetCurrency}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={clear}
            className="col-span-4 rounded-lg bg-red-500 p-3 font-bold text-white shadow-sm hover:bg-red-600 active:translate-y-0.5 transition-all"
          >
            CLEAR
          </button>

          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => (btn === '=' ? commitResult() : handleClick(btn))}
              className={`rounded-lg p-4 text-xl font-bold shadow-sm active:translate-y-0.5 transition-all
                ${
                  btn === '='
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : ['/', '*', '-', '+'].includes(btn)
                    ? 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                    : 'bg-white text-gray-800 hover:bg-gray-50 ring-1 ring-gray-200'
                }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
