'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface AuraCrystalLogoProps {
  scrollProgress?: number;
  className?: string;
  onClick?: () => void;
}

export function AuraCrystalLogo({ scrollProgress = 0, className, onClick }: AuraCrystalLogoProps) {
  const { isGlass } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const requestRef = useRef<number>();
  const [time, setTime] = useState(0);

  // Smooth animation loop for the breathing effect
  useEffect(() => {
    if (!isGlass) return;
    let startTime = performance.now();
    
    const animate = (now: number) => {
      setTime((now - startTime) * 0.001); // Convert to seconds
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isGlass]);

  const handlePointerDown = () => setIsPressed(true);
  const handlePointerUp = () => setIsPressed(false);

  if (!isGlass) {
    // Brutalist fallback: Sharp, heavy, ink-like
    return (
      <div 
        className={cn(
          "font-black uppercase tracking-tighter text-foreground cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5",
          className
        )}
        onClick={onClick}
      >
        <div className="w-4 h-4 bg-foreground relative overflow-hidden">
           <div className="absolute inset-0 bg-background/20 mix-blend-difference transform rotate-45 translate-x-1" />
        </div>
        <span className="leading-none pt-0.5">Aura</span>
      </div>
    );
  }

  // Calculate breathing physics (1 cycle = ~4 seconds)
  const breathingScale = 1 + Math.sin(time * 1.5) * 0.04;
  const breathingOpacity = 0.7 + Math.sin(time * 1.5) * 0.3;
  const innerRotation = time * 20;

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
    >
      <div className={cn(
        "relative w-7 h-7 flex items-center justify-center transition-all duration-400 ease-out",
        isPressed ? "scale-85" : "group-hover:scale-105"
      )}>
        
        {/* Ambient Glow */}
        <div 
          className="absolute inset-[-40%] rounded-full blur-[10px] transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(circle at center, rgba(162, 199, 255, ${breathingOpacity * 0.6}), transparent 70%)`,
            transform: `scale(${breathingScale})`,
            opacity: isPressed ? 1 : 0.6
          }}
        />

        {/* Outer Ring - Refractive Glass */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
        >
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(198,170,255,0.6)" />
            </linearGradient>
            <filter id="ringBlur">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle 
            cx="50" cy="50" r="42" 
            fill="transparent" 
            stroke="url(#ringGrad)" 
            strokeWidth="8"
            filter="url(#ringBlur)"
            className="transition-transform duration-700"
            style={{ transform: `rotate(${scrollProgress * 90}deg)`, transformOrigin: 'center' }}
          />
          {/* Edge highlight */}
          <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(10,30,60,0.1)" strokeWidth="1" />
        </svg>

        {/* Inner Core - The "Aura" Engine */}
        <div 
          className="absolute z-20 w-[42%] h-[42%] bg-white rounded-full overflow-hidden transition-transform duration-300"
          style={{ 
            transform: `scale(${isPressed ? 0.8 : breathingScale})`,
            boxShadow: `
              0 0 12px rgba(255,255,255,0.8),
              inset 0 2px 4px rgba(0,0,0,0.2)
            `
          }}
        >
          {/* Prismatic center */}
          <div 
            className="absolute inset-[-50%] w-[200%] h-[200%]"
            style={{
              background: 'conic-gradient(from 0deg, #ff7b72, #fbbf24, #34d399, #60a5fa, #a78bfa, #ff7b72)',
              transform: `rotate(${innerRotation}deg)`,
              opacity: 0.85,
              mixBlendMode: 'screen'
            }}
          />
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        </div>
      </div>

      <span className={cn(
        "text-[1.05rem] font-bold tracking-tight transition-all duration-300 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 pt-0.5",
        isPressed ? "opacity-70 scale-95" : "opacity-100"
      )}>
        Aura
      </span>
    </div>
  );
}
