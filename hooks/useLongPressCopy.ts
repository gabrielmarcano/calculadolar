import { useState, useRef, useCallback } from 'react';
import { triggerHaptic } from '@/lib/utils';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 10; // px — ignore small finger drift

export function useLongPressCopy() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTranslateY, setToastTranslateY] = useState(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastSwipeStart = useRef<number | null>(null);
  const capturedElement = useRef<HTMLElement | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    setToastTranslateY(0);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(null);
    setToastTranslateY(0);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pointerOrigin.current = null;
    capturedElement.current = null;
  }, []);

  const startLongPress = useCallback((x: number, y: number, value: string, label: string) => {
    cancelLongPress();
    didLongPress.current = false;
    pointerOrigin.current = { x, y };
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      triggerHaptic();
      // Copy + toast immediately when the timer fires
      navigator.clipboard.writeText(value).catch(() => {
        // Clipboard may be blocked in setTimeout — best-effort
      }).finally(() => {
        showToast(`${label} copiado`);
      });
    }, LONG_PRESS_MS);
  }, [showToast, cancelLongPress]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerOrigin.current) return;
    const dx = e.clientX - pointerOrigin.current.x;
    const dy = e.clientY - pointerOrigin.current.y;
    if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
      cancelLongPress();
    }
  }, [cancelLongPress]);

  /**
   * Bind these to a pressable element. `onTap` fires only on short tap.
   * Use `touchAction: 'pan-y'` for elements inside scrollable containers.
   */
  const getLongPressProps = (value: string, label: string, options?: { onTap?: () => void; touchAction?: string }) => ({
    onPointerDown: (e: React.PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      capturedElement.current = el;
      startLongPress(e.clientX, e.clientY, value, label);
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (capturedElement.current) {
        capturedElement.current.releasePointerCapture(e.pointerId);
        capturedElement.current = null;
      }
      const wasLongPress = didLongPress.current;
      cancelLongPress();

      if (!wasLongPress && options?.onTap) {
        options.onTap();
      }
    },
    onPointerMove: handlePointerMove,
    onPointerCancel: () => {
      capturedElement.current = null;
      cancelLongPress();
    },
    ...(options?.touchAction ? { style: { touchAction: options.touchAction } as React.CSSProperties } : {}),
  });

  const toastProps = {
    toastMessage,
    toastTranslateY,
    setToastTranslateY,
    toastSwipeStart,
    dismissToast,
  };

  return { getLongPressProps, toastProps };
}
