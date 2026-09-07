import React from 'react';
import { triggerHaptic } from '@/lib/utils';

interface CalculatorTopBarProps {
  isOffline?: boolean;
  isReversed: boolean;
  onOpenRates: () => void;
  onToggleCurrency: () => void;
  onOpenSettings: () => void;
}

export default function CalculatorTopBar({
  isOffline = false,
  isReversed,
  onOpenRates,
  onToggleCurrency,
  onOpenSettings,
}: CalculatorTopBarProps) {
  return (
    <div className="flex-none flex justify-between items-center px-4 py-3 border-b border-gray-800/40 relative z-10">
      {/* Left: Tasas */}
      <div className="flex items-center min-w-[72px]">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerHaptic();
            onOpenRates();
          }}
          onClick={(e) => {
            e.preventDefault();
            onOpenRates();
          }}
          className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#333333] text-gray-200 text-xs font-semibold py-2 px-3.5 rounded-full transition-transform duration-75 ease-out active:scale-95 will-change-transform border border-white/5 shadow-sm min-h-[44px] cursor-pointer"
          title="Ver tasas de cambio"
          aria-label="Ver tasas de cambio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-emerald-400 shrink-0 pointer-events-none"
          >
            <path
              fillRule="evenodd"
              d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-5 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm-5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm14-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM4 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="pointer-events-none">Tasas</span>
          {isOffline && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse ml-0.5 shrink-0 pointer-events-none"
              title="Modo sin conexión"
            />
          )}
        </button>
      </div>

      {/* Center: Currency Toggle (Tap anywhere to flip USD <-> VES) */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerHaptic();
            onToggleCurrency();
          }}
          onClick={(e) => {
            e.preventDefault();
            onToggleCurrency();
          }}
          className="relative flex items-center bg-[#1e1e22] hover:bg-[#26262c] active:scale-95 transition-transform duration-75 ease-out will-change-transform p-1 rounded-full border border-white/10 shadow-inner cursor-pointer"
          aria-label={`Cambiar moneda activa. Actual: ${isReversed ? 'VES' : 'USD'}`}
          title="Toca para alternar moneda"
        >
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#454555] rounded-full shadow-sm pointer-events-none will-change-transform"
            style={{
              transform: isReversed ? 'translateX(100%)' : 'translateX(0%)',
              transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <span
            className={`relative z-10 text-xs font-bold py-1.5 px-4 rounded-full transition-colors duration-150 min-h-[32px] min-w-[52px] flex items-center justify-center pointer-events-none ${
              !isReversed ? 'text-white' : 'text-zinc-400'
            }`}
          >
            USD
          </span>
          <span
            className={`relative z-10 text-xs font-bold py-1.5 px-4 rounded-full transition-colors duration-150 min-h-[32px] min-w-[52px] flex items-center justify-center pointer-events-none ${
              isReversed ? 'text-white' : 'text-zinc-400'
            }`}
          >
            VES
          </span>
        </button>
      </div>

      {/* Right: Settings Button */}
      <div className="flex items-center justify-end min-w-[72px]">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerHaptic();
            onOpenSettings();
          }}
          onClick={(e) => {
            e.preventDefault();
            onOpenSettings();
          }}
          className="w-10 h-10 rounded-full bg-[#252525] hover:bg-[#333333] active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-transform duration-75 ease-out will-change-transform border border-white/5 shadow-sm cursor-pointer"
          aria-label="Abrir configuración"
          title="Configuración"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 pointer-events-none"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
