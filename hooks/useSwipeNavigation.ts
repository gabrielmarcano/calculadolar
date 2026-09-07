import { useRef, useEffect, useCallback } from 'react';
import { triggerHaptic } from '@/lib/utils';

interface UseSwipeNavigationOptions {
  currentView: 'dashboard' | 'calculator';
  onNavigate: (view: 'dashboard' | 'calculator') => void;
  enabled?: boolean;
}

export function useSwipeNavigation({
  currentView,
  onNavigate,
  enabled = true,
}: UseSwipeNavigationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const directionRef = useRef<'horizontal' | 'vertical' | null>(null);
  const isDraggingRef = useRef(false);

  // Sync track position to currentView when not dragging
  const updateTrackTransform = useCallback((view: 'dashboard' | 'calculator', animate = true) => {
    const track = trackRef.current;
    if (!track) return;

    if (animate) {
      track.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      track.style.transition = 'none';
    }

    const targetPercent = view === 'calculator' ? -50 : 0;
    track.style.transform = `translate3d(${targetPercent}%, 0, 0)`;
  }, []);

  // Update track on view change
  useEffect(() => {
    if (!isDraggingRef.current) {
      updateTrackTransform(currentView, true);
    }
  }, [currentView, updateTrackTransform]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!enabled) return;

    // Do not initiate swipe navigation if touching an internal horizontal scroll area, modal, or input
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-no-swipe], [data-context-bubble], [role="dialog"], input, select, textarea')) {
      return;
    }

    const track = trackRef.current;
    if (track) {
      track.style.transition = 'none';
    }

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    directionRef.current = null;
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current || !enabled) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    // Lock direction on initial movement
    if (!directionRef.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        if (Math.abs(dx) > Math.abs(dy)) {
          directionRef.current = 'horizontal';
          isDraggingRef.current = true;
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
        } else {
          directionRef.current = 'vertical';
          return;
        }
      } else {
        return;
      }
    }

    if (directionRef.current === 'horizontal') {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      const width = container.clientWidth;
      const basePx = currentView === 'calculator' ? -width : 0;
      let newPx = basePx + dx;

      // Rubber-band resistance at outer bounds
      if (newPx > 0) {
        newPx = dx * 0.25;
      } else if (newPx < -width) {
        newPx = -width + (newPx - (-width)) * 0.25;
      }

      track.style.transform = `translate3d(${newPx}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const isHorizontal = directionRef.current === 'horizontal';
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    directionRef.current = null;
    isDraggingRef.current = false;

    if (!isHorizontal) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const width = container.clientWidth;
    const dx = e.clientX - start.x;
    const duration = Math.max(1, Date.now() - start.time);
    const velocity = dx / duration; // px/ms

    let nextView = currentView;

    if (currentView === 'dashboard') {
      // Dragging left (negative dx) moves toward Calculator
      if (dx < -width * 0.25 || velocity < -0.3) {
        nextView = 'calculator';
      }
    } else {
      // Dragging right (positive dx) moves toward Dashboard
      if (dx > width * 0.25 || velocity > 0.3) {
        nextView = 'dashboard';
      }
    }

    updateTrackTransform(nextView, true);

    if (nextView !== currentView) {
      triggerHaptic();
      onNavigate(nextView);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    pointerStartRef.current = null;
    directionRef.current = null;
    isDraggingRef.current = false;
    updateTrackTransform(currentView, true);
  };

  return {
    containerRef,
    trackRef,
    bindSwipe: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    updateTrackTransform,
  };
}
