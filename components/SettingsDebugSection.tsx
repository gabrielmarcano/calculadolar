'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/utils';

export default function SettingsDebugSection() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearCache = () => {
    triggerHaptic();
    try {
      localStorage.removeItem('calculadolar_selected_rates');
      localStorage.removeItem('calculadolar_last_view');
      window.location.reload();
    } catch {}
  };

  return (
    <div className="pt-2 border-t border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
          Depuración
        </span>
        <span className="text-[10px] text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono font-medium">
          DEV ONLY
        </span>
      </div>

      <div className="bg-[#121214] rounded-2xl p-3 border border-amber-500/20 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300 font-medium">Ambiente</span>
          <span className="text-amber-300 font-mono font-semibold">development</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300 font-medium">Respuesta háptica</span>
          <span className="text-gray-200 font-semibold">Activada</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300 font-medium">Modo sin conexión (PWA)</span>
          <span className="text-gray-200 font-semibold">Operativo</span>
        </div>

        <div className="pt-2 border-t border-white/5">
          <button
            onClick={handleClearCache}
            className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] text-amber-300 text-xs font-medium rounded-xl transition-all border border-amber-500/20 cursor-pointer text-center"
          >
            Limpiar caché local y recargar
          </button>
        </div>
      </div>
    </div>
  );
}
