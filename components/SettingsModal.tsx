'use client';

import React, { useState, useRef } from 'react';
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

  if (!isOpen) return null;

  const handleClose = () => {
    triggerHaptic();
    onClose();
  };

  const handleToggle = (currency: string) => {
    triggerHaptic();
    toggleRate(currency);
  };

  // --- DRAG-TO-DISMISS GESTURES ---
  const handlePointerDown = (e: React.PointerEvent) => {
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
      // Elastic resistance when dragging upwards
      currentDragYRef.current = deltaY * 0.15;
      setDragY(deltaY * 0.15);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);

    // If dragged down past 70px, dismiss
    if (currentDragYRef.current > 70) {
      triggerHaptic();
      onClose();
    }
    setDragY(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Drawer */}
      <div
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 200ms ease-out',
        }}
        className="relative w-full max-w-md bg-[#1a1a1c] border-t border-white/10 rounded-t-[2rem] shadow-2xl z-10 px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-250 ease-out overscroll-contain"
      >
        {/* Drag Handle Zone (touch-none to prevent mobile pull-to-refresh) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full py-2 cursor-grab active:cursor-grabbing touch-none flex flex-col items-center"
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Configuración</h2>
            <p className="text-xs text-gray-400">Personaliza la calculadora y cotizaciones</p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[#2a2a2e] hover:bg-[#35353a] active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all border border-white/5"
            aria-label="Cerrar configuración"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
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
                          <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                          <div className="text-xs text-gray-400 font-mono tabular-nums">
                            {price > 0 ? `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs` : 'Sin cotización'}
                          </div>
                        </div>
                      </div>

                      {/* Clean Monochromatic Toggle Switch */}
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                          isSelected ? 'bg-white/30' : 'bg-[#2d2d30]'
                        }`}
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
