import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
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
  }, [ref]);

  return { progress, scrollY };
}

export function useRelativeTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'dzisiaj';
  if (diffDays === 1) return 'wczoraj';
  if (diffDays < 7) return `${diffDays} dni temu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
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
