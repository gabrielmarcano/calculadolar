import React, { useState } from 'react';
import { useLongPressCopy } from '@/hooks/useLongPressCopy';
import { useCalculatorLogic } from '@/hooks/useCalculatorLogic';
import CalculatorTopBar from '@/components/CalculatorTopBar';
import CalculatorDisplay from '@/components/CalculatorDisplay';
import CalculatorRates from '@/components/CalculatorRates';
import CalculatorKeypad from '@/components/CalculatorKeypad';
import SettingsModal from '@/components/SettingsModal';
import Toast from '@/components/Toast';

interface CalculatorViewProps {
  rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
  isOffline?: boolean;
  onOpenRates?: () => void;
  onBack?: () => void;
}

export default function CalculatorView({
  rates,
  isOffline = false,
  onOpenRates,
  onBack,
}: CalculatorViewProps) {
  const handleOpenRates = onOpenRates || onBack || (() => {});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    input,
    result,
    numericResult,
    cursorIndex,
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
  } = useCalculatorLogic({ rates });

  const { bindDirectCopy, toastProps, showToast } = useLongPressCopy();

  const handleRateTap = (convertedStr: string) => {
    toggleReversed();
    updateInput(convertedStr);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden bg-[#121212] text-white font-sans select-none">
      {/* Top Bar: Tasas (Left), Currency Switcher (Center), Settings Gear (Right) */}
      <CalculatorTopBar
        isOffline={isOffline}
        isReversed={isReversed}
        onOpenRates={handleOpenRates}
        onToggleCurrency={toggleReversed}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Screen / Calculation Display Area & Rates */}
      <div className="flex-none flex-shrink-0 flex flex-col justify-end pt-3 px-6 pb-1 space-y-4 relative z-20">
        <CalculatorDisplay
          input={input}
          result={result}
          cursorIndex={cursorIndex}
          isReversed={isReversed}
          onTapCursorPosition={setCursorIndex}
          onCommitResult={commitResult}
          onUpdateInput={updateInput}
          showToast={showToast}
        />

        <CalculatorRates
          rates={rates}
          selectedRates={selectedRates}
          numericResult={numericResult}
          isReversed={isReversed}
          onRateTap={handleRateTap}
          bindDirectCopy={bindDirectCopy}
        />
      </div>

      {/* Keypad */}
      <CalculatorKeypad
        onClick={handleClick}
        onBackspace={handleBackspace}
        onClear={handleClear}
        onCommitResult={commitResult}
        onParentheses={handleParentheses}
        onPercent={handlePercent}
      />

      {/* Settings Bottom Sheet */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        rates={rates}
        selectedRates={selectedRates}
        toggleRate={toggleRate}
      />

      {/* Toast Notification Portal */}
      <Toast {...toastProps} />
    </div>
  );
}
