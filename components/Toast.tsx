import { MutableRefObject } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  toastMessage: string | null;
  toastTranslateY: number;
  setToastTranslateY: (y: number) => void;
  toastSwipeStart: MutableRefObject<number | null>;
  dismissToast: () => void;
}

export default function Toast({ toastMessage, toastTranslateY, setToastTranslateY, toastSwipeStart, dismissToast }: ToastProps) {
  if (!toastMessage) return null;

  return createPortal(
    <div
      className="fixed bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none px-4"
      style={{
        transform: `translateY(${toastTranslateY}px)`,
        opacity: toastTranslateY > 30 ? Math.max(0, 1 - (toastTranslateY - 30) / 40) : 1,
        transition: toastTranslateY === 0 ? 'none' : undefined,
      }}
    >
      <div
        className="pointer-events-auto bg-[#2d2d2d] border border-white/10 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-200"
        onPointerDown={(e) => {
          toastSwipeStart.current = e.clientY;
        }}
        onPointerMove={(e) => {
          if (toastSwipeStart.current === null) return;
          const dy = e.clientY - toastSwipeStart.current;
          if (dy > 0) setToastTranslateY(dy);
        }}
        onPointerUp={() => {
          if (toastTranslateY > 50) {
            dismissToast();
          } else {
            setToastTranslateY(0);
          }
          toastSwipeStart.current = null;
        }}
      >
        {toastMessage}
      </div>
    </div>,
    document.body
  );
}
