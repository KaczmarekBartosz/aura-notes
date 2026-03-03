'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface AuraCrystalLogoProps {
  scrollProgress?: number;
  className?: string;
  onClick?: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function blobRadius(time: number, phase: number): string {
  const a = 53 + Math.sin(time * 1.4 + phase) * 9;
  const b = 45 + Math.cos(time * 1.1 + phase * 0.7) * 8;
  const c = 61 + Math.sin(time * 1.7 + phase * 0.5) * 7;
  const d = 39 + Math.cos(time * 1.35 + phase) * 7;
  return `${a}% ${b}% ${c}% ${d}% / ${d}% ${c}% ${b}% ${a}%`;
}

export function AuraCrystalLogo({ scrollProgress = 0, className, onClick }: AuraCrystalLogoProps) {
  const { isGlass } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const requestRef = useRef<number | null>(null);
  const [time, setTime] = useState(0);
  const [motionGranted, setMotionGranted] = useState(false);
  const [needsMotionPermission, setNeedsMotionPermission] = useState(false);
  
  // Gyroscopic Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const ensureMotionPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return;
    const DeviceOrientationCtor = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientationCtor.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationCtor.requestPermission();
        setMotionGranted(result === 'granted');
      } catch {
        setMotionGranted(false);
      }
      return;
    }

    setMotionGranted(true);
  }, []);

  useEffect(() => {
    if (!isGlass || typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      setNeedsMotionPermission(false);
      setMotionGranted(false);
      return;
    }

    const DeviceOrientationCtor = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    const requiresPermission = typeof DeviceOrientationCtor.requestPermission === 'function';
    setNeedsMotionPermission(requiresPermission);
    if (!requiresPermission) {
      setMotionGranted(true);
    }
  }, [isGlass]);

  // Device orientation listener (Gyroscopic Glass Effect)
  useEffect(() => {
    if (!isGlass || !motionGranted || typeof window === 'undefined' || !window.DeviceOrientationEvent) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // e.gamma is left-to-right tilt in degrees, where right is positive (-90 to 90)
      // e.beta is front-to-back tilt in degrees, where front is positive (-180 to 180)
      if (e.gamma !== null && e.beta !== null) {
        // Constrain and normalize to a -1 to 1 range
        const maxTilt = 30; // degrees
        const x = Math.max(-1, Math.min(1, e.gamma / maxTilt));
        // beta usually rests at around 45deg when holding phone naturally
        const y = Math.max(-1, Math.min(1, (e.beta - 45) / maxTilt));
        
        // Smooth out the values slightly (lerp) could be done here, but simple assignment is okay for 60hz events
        setTilt({ x, y });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isGlass, motionGranted]);

  // Smooth animation loop
  useEffect(() => {
    let startTime = performance.now();
    
    const animate = (now: number) => {
      setTime((now - startTime) * 0.001); // Convert to seconds
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handlePointerDown = () => {
    setIsPressed(true);
    if (isGlass) {
      void ensureMotionPermission();
    }
  };
  const handlePointerUp = () => setIsPressed(false);

  const breathe = 1 + Math.sin(time * 1.65) * 0.055;
  const shellRotation = scrollProgress * 120 + time * 16;
  const driftX = tilt.x * 4.8;
  const driftY = tilt.y * 4.8;
  const glowOpacity = isPressed ? 0.98 : 0.68 + Math.sin(time * 1.9) * 0.18;
  const mainBlob = blobRadius(time, 0.15);
  const overlayBlob = blobRadius(time, 1.3);
  const coreBlob = blobRadius(time, 2.4);
  const centerX = 50 + tilt.x * 11;
  const centerY = 50 + tilt.y * 9;
  const coreScale = isPressed ? 0.82 : breathe;
  const textGradient = isGlass
    ? 'linear-gradient(132deg, rgba(4,18,42,1) 0%, rgba(36,92,168,0.95) 58%, rgba(22,164,235,0.88) 100%)'
    : 'linear-gradient(130deg, rgba(6,20,45,1) 0%, rgba(37,95,173,1) 52%, rgba(79,179,243,0.95) 100%)';

  return (
    <div 
      className={cn(
        "relative cursor-pointer flex items-center gap-2 group",
        className
      )}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={(e) => {
        if (isGlass && motionGranted) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setTilt({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) });
      }}
      onPointerOut={() => {
        if (!isGlass || !motionGranted) {
          setTilt({ x: 0, y: 0 });
        }
      }}
      style={{ perspective: '200px' }}
    >
      <div className={cn(
        "relative w-8 h-8 flex items-center justify-center transition-all duration-400 ease-out"
      )}
      style={{
        transform: `rotateX(${-tilt.y * 16}deg) rotateY(${tilt.x * 16}deg) scale(${isPressed ? 0.93 : 1})`
      }}>

        <div
          className="absolute inset-[-46%] blur-[16px] transition-opacity duration-500 z-0"
          style={{
            borderRadius: '54% 46% 61% 39% / 45% 56% 44% 55%',
            background: isGlass
              ? `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(129, 224, 255, ${glowOpacity}), rgba(153, 123, 255, 0.22) 40%, rgba(153, 123, 255, 0) 76%)`
              : `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(76, 196, 255, ${glowOpacity * 0.9}), rgba(53, 106, 199, 0.24) 40%, rgba(53, 106, 199, 0) 76%)`,
            transform: `scale(${breathe})`,
            opacity: glowOpacity,
          }}
        />

        <div
          className="absolute inset-0 z-10 transition-transform duration-500"
          style={{
            borderRadius: mainBlob,
            transform: `translate(${driftX}px, ${driftY}px) rotate(${shellRotation * 0.32}deg)`,
            background: `
              conic-gradient(
                from ${shellRotation}deg at ${centerX}% ${centerY}%,
                rgba(98, 235, 255, 0.92) 0deg,
                rgba(146, 134, 255, 0.92) 88deg,
                rgba(255, 116, 198, 0.88) 164deg,
                rgba(93, 162, 255, 0.94) 248deg,
                rgba(98, 235, 255, 0.92) 360deg
              )
            `,
            boxShadow: isGlass
              ? '0 10px 22px rgba(19, 51, 108, 0.24), inset 0 1px 0 rgba(255,255,255,0.78), inset 0 -1px 0 rgba(12,31,68,0.2)'
              : '0 9px 20px rgba(12, 44, 96, 0.24), inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(10,26,56,0.22)',
          }}
        />

        <div
          className="absolute inset-[2px] z-20 transition-transform duration-500 mix-blend-screen"
          style={{
            borderRadius: overlayBlob,
            transform: `translate(${driftX * 0.6}px, ${driftY * 0.6}px) rotate(${-shellRotation * 0.22}deg)`,
            background: `
              radial-gradient(70% 64% at 24% 18%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.16) 68%, rgba(255,255,255,0) 100%),
              linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.02) 72%)
            `,
            opacity: isPressed ? 0.94 : 0.82,
          }}
        />

        <div
          className="absolute inset-[3px] z-30 border"
          style={{
            borderRadius: overlayBlob,
            borderColor: isGlass ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.52)',
            transform: `rotate(${time * 18}deg)`,
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 z-40"
          style={{
            borderRadius: coreBlob,
            transform: `translate(${driftX * 0.35}px, ${driftY * 0.35}px) scale(${coreScale}) rotate(${time * 28}deg)`,
            background: `
              linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(207,236,255,0.95) 34%, rgba(118,184,255,0.9) 100%)
            `,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.78), 0 0 14px rgba(113, 196, 255, 0.5)',
          }}
        >
          <div
            className="absolute inset-[18%]"
            style={{
              borderRadius: coreBlob,
              background: 'conic-gradient(from 0deg, rgba(48,124,220,0.9), rgba(113,236,255,0.9), rgba(167,122,255,0.9), rgba(48,124,220,0.9))',
              transform: `rotate(${time * 44}deg)`,
              opacity: 0.94,
            }}
          />
        </div>

        <div
          className="absolute left-[65%] top-[24%] z-50 h-[18%] w-[21%] blur-[0.4px]"
          style={{
            borderRadius: '72% 28% 67% 33% / 47% 62% 38% 53%',
            background: 'rgba(255, 255, 255, 0.84)',
            opacity: isPressed ? 0.98 : 0.74,
            transform: `translate(${driftX * 0.2}px, ${driftY * 0.2}px)`,
          }}
        />
      </div>

      <span className={cn(
        "text-[1.05rem] font-semibold tracking-tight transition-all duration-300 bg-clip-text text-transparent pt-0.5",
        isPressed ? "opacity-70 scale-95" : "opacity-100"
      )}
      style={{
        backgroundImage: textGradient,
      }}>
        Aura
      </span>
      {needsMotionPermission && !motionGranted && (
        <span className="sr-only">Dotknij logo, aby włączyć efekt żyroskopowy</span>
      )}
    </div>
  );
}
