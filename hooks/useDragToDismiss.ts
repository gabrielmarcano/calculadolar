import { useState, useRef, useCallback } from 'react';
import { triggerHaptic } from '@/lib/utils';

interface UseDragToDismissOptions {
  isOpen: boolean;
  onDismiss: () => void;
  threshold?: number;
}

export function useDragToDismiss({
  isOpen,
  onDismiss,
  threshold = 60,
}: UseDragToDismissOptions) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const currentDragYRef = useRef(0);

  const resetDrag = useCallback(() => {
    setDragY(0);
    currentDragYRef.current = 0;
    setIsDragging(false);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore clicks on buttons inside header (like close button)
    if ((e.target as HTMLElement).closest('button')) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    startYRef.current = e.clientY;
    currentDragYRef.current = 0;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
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
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);

      if (currentDragYRef.current > threshold) {
        triggerHaptic();
        onDismiss();
      }
      setDragY(0);
      currentDragYRef.current = 0;
    },
    [onDismiss, threshold]
  );

  const translateYStyle = !isOpen
    ? 'translateY(100%)'
    : dragY !== 0
    ? `translateY(${dragY}px)`
    : 'translateY(0)';

  return {
    dragY,
    isDragging,
    translateYStyle,
    resetDrag,
    dragProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
