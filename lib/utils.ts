import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    // Check if user has not reduced motion (optional but good practice)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const patterns = {
      light: 10,
      medium: 20,
      heavy: [15, 5, 15]
    };
    window.navigator.vibrate(patterns[type]);
  }
}
