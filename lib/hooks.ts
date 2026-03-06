import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useScrollProgress(ref: React.RefObject<HTMLElement | null>, enabled = true) {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      setProgress(maxScroll > 0 ? scrollTop / maxScroll : 0);
      setScrollY(scrollTop);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [ref, enabled]);

  return { progress, scrollY };
}

export function useCollapsibleHeader(scrollRef: React.RefObject<HTMLElement | null>, threshold = 10) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const currentY = el.scrollTop;
      if (currentY > lastScrollY.current && currentY > threshold) {
        setIsHidden(true);
      } else if (currentY < lastScrollY.current) {
        setIsHidden(false);
      }
      lastScrollY.current = currentY;
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollRef, threshold]);

  return isHidden;
}

export function useEdgeSwipe(onSwipe: () => void, edgeWidth = 20) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isEdge = useRef(false);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const x = e.touches[0].clientX;
      touchStartX.current = x;
      touchStartY.current = e.touches[0].clientY;
      isEdge.current = x <= edgeWidth;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!isEdge.current) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      if (dx > 80 && dy < 100) {
        onSwipe();
      }
      isEdge.current = false;
    },
  };

  return handlers;
}
