'use client';

import { useEffect } from 'react';

const SAT_KEY = 'calculadolar_sat';
const SAB_KEY = 'calculadolar_sab';

export function useSafeArea(): void {
  useEffect(() => {
    const probe = document.getElementById('safe-area-probe');
    if (!probe) return;

    const updateInsets = () => {
      const top = probe.offsetHeight;
      const bottom = probe.offsetWidth;

      if (top > 0) {
        const topPx = `${top}px`;
        if (localStorage.getItem(SAT_KEY) !== topPx) {
          localStorage.setItem(SAT_KEY, topPx);
          document.documentElement.style.setProperty('--sat', topPx);
        }
      }

      if (bottom > 0) {
        const bottomPx = `${bottom}px`;
        if (localStorage.getItem(SAB_KEY) !== bottomPx) {
          localStorage.setItem(SAB_KEY, bottomPx);
          document.documentElement.style.setProperty('--sab', bottomPx);
        }
      }
    };

    updateInsets();

    const ro = new ResizeObserver(updateInsets);
    ro.observe(probe);

    window.addEventListener('resize', updateInsets);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateInsets);
    };
  }, []);
}
