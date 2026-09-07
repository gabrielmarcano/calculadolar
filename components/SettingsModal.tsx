'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: Record<string, { price: number; displayName: string; imageUrl: string | null }>;
  selectedRates: string[];
  toggleRate: (currency: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  rates,
  selectedRates,
  toggleRate,
}: SettingsModalProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const currentDragYRef = useRef(0);

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
    setDragY(0);
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

  // --- DRAG-TO-DISMISS GESTURES ---
  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore clicks on buttons inside header (like close button)
    if ((e.target as HTMLElement).closest('button')) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    startYRef.current = e.clientY;
    currentDragYRef.current = 0;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startYRef.current;
    if (deltaY > 0) {
      currentDragYRef.current = deltaY;
      setDragY(deltaY);
    } else {
      // Elastic resistance when pulling up
      currentDragYRef.current = deltaY * 0.15;
      setDragY(deltaY * 0.15);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);

    // If dragged down past 60px, dismiss
    if (currentDragYRef.current > 60) {
      triggerHaptic();
      onClose();
    }
    setDragY(0);
  };

  // Calculate transform for smooth slide-up from bottom
  const translateYStyle = !isOpen
    ? 'translateY(100%)'
    : dragY !== 0
    ? `translateY(${dragY}px)`
    : 'translateY(0)';

  return (
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full touch-none cursor-grab active:cursor-grabbing select-none"
        >
          {/* Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3" />

          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Configuración</h2>
              <p className="text-xs text-gray-400">Personaliza la calculadora y cotizaciones</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-[#2a2a2e] hover:bg-[#35353a] active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all border border-white/5 cursor-pointer"
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
                  const displayName = rate?.displayName || currency;
                  const imageUrl = rate?.imageUrl;
                  const price = rate?.price || 0;

                  return (
                    <button
                      key={currency}
                      onClick={() => handleToggle(currency)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all min-h-[48px] active:scale-[0.98] border ${
                        isSelected
                          ? 'bg-white/10 text-white border-white/15 shadow-sm'
                          : 'bg-transparent text-gray-400 border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={displayName}
                            width={56}
                            height={56}
                            className="w-7 h-7 rounded-full object-contain shrink-0"
                            unoptimized
                            priority
                          />
                        )}
                        <div className="text-left truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-sm font-semibold text-white truncate">{displayName}</span>
                            {isLocked && (
                              <span className="text-[10px] text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded-full font-medium">
                                Fija
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono tabular-nums">
                            {price > 0 ? `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs` : 'Sin cotización'}
                          </div>
                        </div>
                      </div>

                      {/* Clean Monochromatic Toggle Switch */}
                      <div
                        className={`w-11 h-6 rounded-full transition-all relative flex items-center p-0.5 shrink-0 ${
                          isSelected
                            ? isLocked
                              ? 'bg-white/20 opacity-80 cursor-not-allowed'
                              : 'bg-white/30'
                            : 'bg-[#2d2d30]'
                        }`}
                        title={isLocked ? 'Al menos una cotización debe permanecer activa' : undefined}
                      >
                        <div
                          className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                            isSelected ? 'translate-x-5 bg-white' : 'translate-x-0 bg-gray-400'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: System info */}
          <div className="pt-2 border-t border-white/5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">Preferencias</span>
            <div className="bg-[#121214] rounded-2xl p-3 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Respuesta háptica</span>
                <span className="text-gray-200 font-semibold">Activada</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Modo sin conexión (PWA)</span>
                <span className="text-gray-200 font-semibold">Operativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
