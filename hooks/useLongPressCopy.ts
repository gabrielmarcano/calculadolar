import { useState, useRef, useCallback } from 'react';
import { triggerHaptic } from '@/lib/utils';
import { copyToClipboard } from '@/lib/clipboard';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 10; // px — ignore small finger drift

export interface GestureBindingOptions {
  onTap?: () => void;
  touchAction?: string;
}

export interface ContextMenuGestureOptions {
  onLongPress: () => void;
  onTap?: () => void;
  touchAction?: string;
}

export function useLongPressCopy() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTranslateY, setToastTranslateY] = useState(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const wasLongPressRef = useRef(false);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastSwipeStartRef = useRef<number | null>(null);
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

  const didMoveRef = useRef(false);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerOrigin.current) return;
    const dx = e.clientX - pointerOrigin.current.x;
    const dy = e.clientY - pointerOrigin.current.y;
    if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
      didMoveRef.current = true;
      cancelLongPress();
    }
  }, [cancelLongPress]);

  /**
   * Internal reusable gesture handler for pointer down/up/move/cancel.
   */
  const createBinding = useCallback((
    onLongPressAction: () => void,
    onTapAction?: () => void,
    touchAction?: string
  ) => ({
    onPointerDown: (e: React.PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
      capturedElement.current = el;
      cancelLongPress();
      didLongPress.current = false;
      wasLongPressRef.current = false;
      didMoveRef.current = false;
      pointerOrigin.current = { x: e.clientX, y: e.clientY };

      longPressTimer.current = setTimeout(() => {
        didLongPress.current = true;
        triggerHaptic();
        onLongPressAction();
      }, LONG_PRESS_MS);
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (capturedElement.current) {
        try {
          capturedElement.current.releasePointerCapture(e.pointerId);
        } catch {}
        capturedElement.current = null;
      }

      const wasLong = didLongPress.current;
      const didMove = didMoveRef.current;
      cancelLongPress();

      if (wasLong) {
        wasLongPressRef.current = true;
        setTimeout(() => {
          wasLongPressRef.current = false;
        }, 150);
      } else if (!didMove && onTapAction) {
        onTapAction();
      }
    },
    onPointerMove: handlePointerMove,
    onPointerCancel: (e: React.PointerEvent) => {
      if (capturedElement.current) {
        try {
          capturedElement.current.releasePointerCapture(e.pointerId);
        } catch {}
        capturedElement.current = null;
      }
      didMoveRef.current = true;
      cancelLongPress();
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (wasLongPressRef.current || didMoveRef.current) {
        e.stopPropagation();
        e.preventDefault();
        wasLongPressRef.current = false;
      }
    },
    ...(touchAction ? { style: { touchAction } as React.CSSProperties } : {}),
  }), [cancelLongPress, handlePointerMove]);

  /**
   * Bind to Read-Only values (result, rate rows, rate cards).
   * Long-press: directly copies value to clipboard with haptic feedback and toast.
   * Short-tap: invokes options.onTap() if provided.
   */
  const bindDirectCopy = useCallback((
    value: string,
    label: string,
    options?: GestureBindingOptions
  ) => {
    return createBinding(
      () => {
        copyToClipboard(value).finally(() => {
          showToast(`${label} copiado`);
        });
      },
      options?.onTap,
      options?.touchAction
    );
  }, [createBinding, showToast]);

  /**
   * Bind to Editable areas (calculator input display).
   * Long-press: triggers onLongPress callback (e.g. opens contextual bubble [Copiar | Pegar]).
   * Does NOT touch clipboard, ensuring external copied text is preserved.
   * Short-tap: invokes options.onTap() if provided.
   */
  const bindContextMenu = useCallback((
    options: ContextMenuGestureOptions
  ) => {
    return createBinding(
      options.onLongPress,
      options.onTap,
      options.touchAction
    );
  }, [createBinding]);

  const toastProps = {
    toastMessage,
    toastTranslateY,
    setToastTranslateY,
    toastSwipeStartRef,
    dismissToast,
  };

  return {
    bindDirectCopy,
    bindContextMenu,
    getLongPressProps: bindDirectCopy, // Backward-compatible alias
    toastProps,
    showToast,
    dismissToast,
  };
}
