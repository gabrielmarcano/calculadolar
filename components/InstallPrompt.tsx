import { triggerHaptic } from "@/lib/utils";

interface InstallPromptProps {
    onInstall: () => void;
    onDismiss?: () => void;
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
    return (
        <div className="w-full px-4 mb-4 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="bg-[#1e1e1e]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-xl relative overflow-hidden group">
                
                {/* Content */}
                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">Instalar Calculadolar</span>
                        <span className="text-gray-400 text-xs">Acceso rápido y sin conexión</span>
                    </div>
                </div>

                {/* Actions */}
                <button
                    onClick={() => {
                        triggerHaptic();
                        onInstall();
                    }}
                    className="relative z-10 bg-white hover:bg-gray-200 text-black text-xs font-bold py-2 px-4 rounded-full transition-colors active:scale-95"
                >
                    Instalar
                </button>
                
                {/* Close/Dismiss (Optional, maybe implied by ignoring) */}
                {/* We can add a small X if needed, but 'Integrate' usually means keep it simple */}

                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </div>
        </div>
    );
}
