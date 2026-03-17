import { useState, useCallback, useRef } from 'react';

export function useDoubleTap(callback: () => void, delay: number = 320) {
  const lastTap = useRef<number>(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      callback();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [callback, delay]);

  return handleTap;
}
