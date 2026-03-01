'use client';

import { useEffect } from 'react';

const LIGHT_THEME_COLOR = '#f2f3f7';
const DARK_THEME_COLOR = '#2a2b33';

function setThemeColorMeta(isDark: boolean) {
  let meta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }

  meta.content = isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
}

export function PwaClientEnhancements() {
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
    const shouldDisableServiceWorker = process.env.NODE_ENV !== 'production' || isLocalhost;

    const clearServiceWorkerState = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        }
      } catch {
        return;
      }
    };

    if ('serviceWorker' in navigator) {
      if (shouldDisableServiceWorker) {
        void clearServiceWorkerState();
      } else {
        const registerServiceWorker = async () => {
          try {
            await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none',
            });
          } catch {
            return;
          }
        };

        if (document.readyState === 'complete') {
          void registerServiceWorker();
        } else {
          window.addEventListener('load', () => {
            void registerServiceWorker();
          }, { once: true });
        }
      }
    }

    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    };

    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    document.addEventListener('touchstart', preventMultiTouch, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    const html = document.documentElement;
    const syncThemeColor = () => {
      setThemeColorMeta(html.classList.contains('dark'));
    };

    const observer = new MutationObserver(syncThemeColor);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    syncThemeColor();

    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('touchstart', preventMultiTouch);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      observer.disconnect();
    };
  }, []);

  return null;
}
