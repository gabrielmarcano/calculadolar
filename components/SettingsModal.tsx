'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { triggerHaptic } from '@/lib/utils';
import { useDragToDismiss } from '@/hooks/useDragToDismiss';
import SettingsDebugSection from '@/components/SettingsDebugSection';
import SettingsRateItem from '@/components/SettingsRateItem';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
  selectedRates: string[];
  toggleRate: (currency: string) => void;
}

const emptySubscribe = () => () => {};

export default function SettingsModal({
  isOpen,
  onClose,
  rates,
  selectedRates,
  toggleRate,
}: SettingsModalProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { translateYStyle, resetDrag, isDragging, dragProps } = useDragToDismiss({
    isOpen,
    onDismiss: onClose,
  });

  // Lock body scroll and overscroll ONLY while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
    };
  }, [isOpen]);

  const handleClose = () => {
    triggerHaptic();
    resetDrag();
    onClose();
  };

  const handleToggle = (currency: string) => {
    const isSelected = selectedRates.includes(currency);
    // Lock: if only 1 rate is active and it's this one, do not deactivate
    if (isSelected && selectedRates.length === 1) {
      triggerHaptic();
      return;
    }
    triggerHaptic();
    toggleRate(currency);
  };

  if (!isClient) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center select-none transition-all duration-300 overscroll-none ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
    >
      {/* Backdrop with fade animation and touch-none to kill pull-to-refresh */}
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-280 ease-out touch-none overscroll-none ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Drawer with slide-up animation */}
      <div
        style={{
          transform: translateYStyle,
          transition: isDragging
            ? 'none'
            : 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative w-full max-w-md bg-[#1a1a1c] border-t border-white/10 rounded-t-[2rem] shadow-2xl z-10 px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] overscroll-none will-change-transform"
      >
        {/* Full Header Drag Zone: handle + title + subtitle (touch-none eliminates pull-to-refresh completely) */}
        <div
          {...dragProps}
          className="w-full touch-none cursor-grab active:cursor-grabbing select-none"
        >
          {/* Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3" />

          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Configuración</h2>
              <p className="text-xs text-gray-400">Personaliza las cotizaciones visibles</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-[#2a2a2e] hover:bg-[#35353a] active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-transform duration-75 ease-out will-change-transform border border-white/5 cursor-pointer"
              aria-label="Cerrar configuración"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 pointer-events-none">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto overscroll-contain touch-pan-y scrollbar-hide">
          {/* Section: Active Rates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cotizaciones Visibles</span>
              <span className="text-[11px] text-gray-400 font-medium">
                {selectedRates.length} activa{selectedRates.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-1.5 bg-[#121214] rounded-2xl p-1.5 border border-white/5">
              {Object.keys(rates).length === 0 ? (
                <div className="text-gray-500 text-xs text-center py-4">No hay cotizaciones disponibles</div>
              ) : (
                Object.keys(rates).map((currency) => {
                  const isSelected = selectedRates.includes(currency);
                  const isLocked = isSelected && selectedRates.length === 1;
                  const rate = rates[currency];

                  return (
                    <SettingsRateItem
                      key={currency}
                      currency={currency}
                      displayName={rate?.displayName || currency}
                      imageUrl={rate?.imageUrl || null}
                      price={rate?.price || 0}
                      isSelected={isSelected}
                      isLocked={isLocked}
                      onToggle={handleToggle}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Debug Menu (Dev only) */}
          <SettingsDebugSection />
        </div>
      </div>
    </div>,
    document.body
  );
}
