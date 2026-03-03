'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import {
  ArrowLeft, BookOpen, Search, Star, Palette, LayoutGrid,
  SlidersHorizontal, X, Activity, ShieldCheck, Cpu, Bookmark,
  PenTool, Calendar, TrendingUp, Archive, ChefHat, Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { NotesPayload, Note } from '@/lib/types';
import { cn, triggerHaptic } from '@/lib/utils';
import {
  useDebounce,
  useScrollProgress,
  useCollapsibleHeader,
  useEdgeSwipe,
} from '@/lib/hooks';
import { useTheme } from '@/lib/theme';
import { ThemeSwitcher } from '@/components/glass';
import { AuraCrystalLogo } from '@/components/glass/AuraCrystalLogo';

type SortMode = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'title_asc';
type AppView = 'browse' | 'desk' | 'search' | 'theme';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? 'local';

const SORT_LABELS: Record<SortMode, string> = {
  updated_desc: 'Najnowsze',
  updated_asc: 'Najstarsze',
  created_desc: 'Utw. ↓',
  created_asc: 'Utw. ↑',
  title_asc: 'A-Z',
};

const CATEGORY_LABELS: Record<string, string> = {
  'fitness-health': 'Fitness',
  'golden-protocols': 'Gold Protocols',
  'ai-agents': 'AI Agents',
  'bookmarks': 'Bookmarks',
  'design': 'Design',
  'daily-log': 'Daily Log',
  'growth-marketing': 'Marketing',
  'outputs': 'Outputs',
  'recipes': 'Recipes',
  'taste': 'Taste',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'fitness-health': <Activity />,
  'golden-protocols': <ShieldCheck />,
  'ai-agents': <Cpu />,
  'bookmarks': <Bookmark />,
  'design': <PenTool />,
  'daily-log': <Calendar />,
  'growth-marketing': <TrendingUp />,
  'outputs': <Archive />,
  'recipes': <ChefHat />,
  'taste': <Sparkles />,
};

/* ── Helpers ── */

function fmtRelative(iso?: string | null): string {
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

function highlightText(text: string, q: string): React.ReactNode {
  if (!q.trim()) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-primary/30 text-foreground px-0.5 font-bold">{part}</mark> : part
  );
}

function getSnippet(content: string, q: string): string | null {
  if (!q.trim()) return null;
  const idx = content.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + q.length + 40);
  return (start > 0 ? '…' : '') + content.slice(start, end).replace(/\n/g, ' ') + (end < content.length ? '…' : '');
}

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */

export default function Page() {
  const { theme, isGlass } = useTheme();

  /* ── Auth state ── */
  const [token, setToken] = useState<string | null>(null);
  const [pass, setPass] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<NotesPayload | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  /* ── Navigation state ── */
  const [activeTab, setActiveTab] = useState<AppView>('browse');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isReaderExiting, setIsReaderExiting] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  /* ── Filter state ── */
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('updated_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  /* ── Easter eggs ── */
  const [dogAnim, setDogAnim] = useState(false);
  const [inkSpills, setInkSpills] = useState<{ id: number; x: number; y: number }[]>([]);

  /* ── Pull-to-refresh ── */
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ── Refs ── */
  const desktopReaderRef = useRef<HTMLDivElement>(null);
  const mobileReaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const pullActive = useRef(false);

  /* ── Aura Spotlight (Pointer Tracking) ── */
  useEffect(() => {
    if (!isGlass || !appContainerRef.current) return;
    const container = appContainerRef.current;
    
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      container.style.setProperty('--pointer-x', `${x}px`);
      container.style.setProperty('--pointer-y', `${y}px`);
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    // Use touch move as well to keep the spotlight alive while dragging
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isGlass]);

  /* ── Derived hooks ── */
  const debouncedQuery = useDebounce(query, 150);
  const { progress: desktopReadProgress, scrollY: desktopScrollY } = useScrollProgress(desktopReaderRef);
  const { progress: mobileReadProgress, scrollY: mobileScrollY } = useScrollProgress(mobileReaderRef);
  const { progress: listProgress } = useScrollProgress(listRef);
  const isHeaderHidden = useCollapsibleHeader(listRef);

  /* ── Navigation handlers ── */

  const openReader = useCallback((id: string) => {
    setSelectedId(id);
    setIsReaderOpen(true);
    setIsReaderExiting(false);
    mobileReaderRef.current?.scrollTo(0, 0);
    desktopReaderRef.current?.scrollTo(0, 0);
  }, []);

  const closeReader = useCallback(() => {
    setIsReaderExiting(true);
    setTimeout(() => {
      setIsReaderOpen(false);
      setIsReaderExiting(false);
    }, 250);
  }, []);

  const selectCategory = useCallback((cat: string | null) => {
    setActiveCategory(cat);
    setActiveTag(null);
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setQuery('');
  }, []);

  const edgeSwipeHandlers = useEdgeSwipe(closeReader);

  /* ── Ink spill Easter egg ── */
  useEffect(() => {
    let lastTime = 0;

    function handleMotion(e: DeviceMotionEvent) {
      if (!e.accelerationIncludingGravity) return;
      const { x, y, z } = e.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > 20) {
        const now = Date.now();
        if (now - lastTime > 1000) {
          lastTime = now;
          setInkSpills(prev => [...prev, {
            id: now,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
          }]);
          setTimeout(() => {
            setInkSpills(prev => prev.filter(spill => spill.id !== now));
          }, 2500);
        }
      }
    }

    if (typeof window !== 'undefined' && window.DeviceMotionEvent && typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, []);

  /* ── Data loading ── */

  async function loadNotes(password: string) {
    setLoading(true);
    setLoginError('');
    try {
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/notes' : '/.netlify/functions/notes';
      const res = await fetch(endpoint, { headers: { 'x-aura-pass': password } });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) { setLoginError('Błędne hasło.'); return; }
      if (!res.ok || !json.ok) { setLoginError(json.error || 'Błąd API notatek'); return; }
      setUnlocking(true);
      await new Promise(r => setTimeout(r, 400));
      setPass(password);
      setToken(password);
      setPayload(json.data);
      if (json.data?.notes?.length) setSelectedId(json.data.notes[0].id);
    } catch {
      setLoginError('Błąd sieci.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Derived data ── */

  const notes = useMemo(() => payload?.notes ?? [], [payload]);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (payload) {
      setPayload({
        ...payload,
        notes: payload.notes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n),
      });
    }
  }, [payload]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    notes
      .filter((n) => n.category !== 'system' && n.category !== 'other')
      .forEach((n) => set.add(n.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [notes]);

  const tagsForCategory = useMemo(() => {
    const set = new Set<string>();
    const base = activeCategory
      ? notes.filter((n) => n.category === activeCategory)
      : notes.filter((n) => n.category !== 'system');
    base.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [notes, activeCategory]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let out = notes.filter((n) => {
      if (activeTab === 'desk') return n.isFavorite;
      if (activeTab === 'search') {
        if (!q) return false;
        if (n.category === 'system') return false;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          n.category.toLowerCase().includes(q)
        );
      }
      // Browse tab
      if (n.category === 'system') return false;
      if (activeCategory && n.category !== activeCategory) return false;
      if (activeTag && !(n.tags || []).includes(activeTag)) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });

    return out.sort((a, b) => {
      switch (sort) {
        case 'updated_asc': return +new Date(a.updatedAt) - +new Date(b.updatedAt);
        case 'created_desc': return +new Date(b.createdAt || b.updatedAt) - +new Date(a.createdAt || a.updatedAt);
        case 'created_asc': return +new Date(a.createdAt || a.updatedAt) - +new Date(b.createdAt || b.updatedAt);
        case 'title_asc': return a.title.localeCompare(b.title, 'pl');
        default: return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      }
    });
  }, [notes, activeTab, activeCategory, activeTag, debouncedQuery, sort]);

  const selected = filtered.find((n) => n.id === selectedId) || notes.find((n) => n.id === selectedId) || null;

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (isReaderOpen) { closeReader(); return; }
        if (isSearchOpen) { closeSearch(); return; }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        if (activeTab !== 'search') setActiveTab('search');
        openSearch();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = filtered.findIndex((n) => n.id === selectedId);
        const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
        if (next >= 0 && next < filtered.length) {
          setSelectedId(filtered[next].id);
          desktopReaderRef.current?.scrollTo(0, 0);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedId, isReaderOpen, isSearchOpen, activeTab, closeReader, closeSearch, openSearch]);

  /* ── Close sort menu on outside click ── */
  useEffect(() => {
    if (!showSortMenu) return;
    const handler = () => setShowSortMenu(false);
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showSortMenu]);

  /* ═══════════════════════════════════════════════
     LOGIN SCREEN
     ═══════════════════════════════════════════════ */

  if (!token) {
    return (
      <div className={cn(
        "aura-theme-scope flex min-h-[100svh] min-h-dvh w-full max-w-full flex-col items-center justify-center p-4 relative overflow-hidden box-border pt-safe transition-all duration-[400ms]",
        isGlass ? "bg-transparent" : "bg-background",
        unlocking && "opacity-0 scale-95"
      )}>
        {isGlass && (
          <div className="aurora-bg" aria-hidden>
            <div className="aurora-blob aurora-blob-1" />
            <div className="aurora-blob aurora-blob-2" />
          </div>
        )}

        <div
          className="absolute z-[90] pointer-events-auto"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
            right: 'calc(env(safe-area-inset-right, 0px) + 0.75rem)',
          }}
        >
          <ThemeSwitcher variant="compact" />
        </div>

        {/* Duck Hunt Dog in retro TV */}
        <button
          onClick={() => { setDogAnim(true); setTimeout(() => setDogAnim(false), 300); }}
          className={cn(
            "absolute bottom-4 right-4 md:bottom-8 md:right-8 origin-bottom hover:scale-105 transition-transform duration-200 pointer-events-auto z-20 cursor-pointer border-none bg-transparent outline-none focus:outline-none flex flex-col items-center",
            dogAnim && "dog-clicked"
          )}
          title="Duck Hunt Mascot!"
        >
          <div className="flex gap-4 md:gap-8 mb-[-2px] z-0">
            <div className="w-1.5 h-8 md:w-2 md:h-14 bg-foreground origin-bottom rotate-[30deg]"></div>
            <div className="w-1.5 h-6 md:w-2 md:h-10 bg-foreground origin-bottom -rotate-[20deg]"></div>
          </div>
          <div className="relative w-48 h-40 md:w-72 md:h-64 bg-foreground p-3 md:p-5 shadow-[8px_8px_0_var(--foreground)/50] flex">
            <div className="relative flex-1 bg-[#8b9bb4] overflow-hidden border-2 md:border-4 border-background/20 rounded-sm flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10 rounded-full blur-md md:blur-xl z-10 pointer-events-none scale-110"></div>
              <div className="absolute inset-0 pointer-events-none z-10 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
              <img src="/duck_hunt_dog.png" alt="Duck Hunt Mascot" className="w-[130%] h-[130%] object-contain pointer-events-none relative z-0 pt-3 md:pt-6 drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="w-8 md:w-12 ml-2 md:ml-4 flex flex-col gap-2 md:gap-4 py-1 md:py-2 items-center">
              <div className="w-4 h-4 md:w-6 md:h-6 bg-background rounded-full mb-1"></div>
              <div className="w-4 h-4 md:w-6 md:h-6 bg-background rounded-full"></div>
              <div className="w-full flex-1 flex flex-col gap-1.5 md:gap-2 justify-end items-center pb-1 md:pb-2 opacity-50">
                <div className="w-4 md:w-6 h-0.5 md:h-1 bg-background"></div>
                <div className="w-4 md:w-6 h-0.5 md:h-1 bg-background"></div>
                <div className="w-4 md:w-6 h-0.5 md:h-1 bg-background"></div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-between px-6 md:px-10 mt-[-2px] z-0">
            <div className="w-3 h-4 md:w-5 md:h-6 bg-foreground skew-x-12"></div>
            <div className="w-3 h-4 md:w-5 md:h-6 bg-foreground -skew-x-12"></div>
          </div>
        </button>

        {!isGlass && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        )}
        <div className={cn(
          "login-auth-card w-full max-w-sm p-8 text-center relative z-10",
          isGlass
            ? "glass-card"
            : "bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)] hover:shadow-[12px_12px_0_var(--foreground)] hover:brightness-[1.015]"
        )}>
          <h1 className={cn(
            "text-4xl tracking-tight mb-2",
            isGlass ? "font-semibold tracking-tighter" : "font-black uppercase"
          )}>Aura Notes</h1>
          <p className={cn(
            "text-sm mb-8",
            isGlass ? "font-medium opacity-70 tracking-tight" : "font-bold uppercase tracking-widest opacity-60"
          )}>Bezpieczny sejf</p>
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); loadNotes(loginInput); }}
          >
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Wprowadź hasło..."
              className={cn(
                "login-auth-input h-12 w-full px-4 text-center transition-all outline-none",
                isGlass ? "font-medium tracking-tight" : "font-mono font-bold",
                isGlass
                  ? "glass-input rounded-2xl border border-foreground/30 dark:border-white/20"
                  : "rounded-none bg-background border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:-translate-y-1 focus-visible:-translate-x-1 focus-visible:shadow-[8px_8px_0_var(--primary)] placeholder:text-muted-foreground shadow-[4px_4px_0_var(--foreground)]"
              )}
            />
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "login-auth-button w-full h-12 transition-all font-black text-lg outline-none",
                isGlass
                  ? "glass-button glass-button-primary rounded-2xl border"
                  : "rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)] hover:bg-foreground hover:text-background active:translate-y-0 active:translate-x-0 active:shadow-none uppercase tracking-wider"
              )}
            >
              {loading ? 'Odblokowywanie...' : 'Odblokuj'}
            </button>
            {loginError && <p className={cn("text-sm text-destructive mt-2", isGlass ? "font-medium" : "font-black uppercase")}>{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     MAIN APP
     ═══════════════════════════════════════════════ */

  return (
    <div
      ref={appContainerRef}
      className={cn(
        'aura-theme-scope h-[100dvh] min-h-[100svh] w-full max-w-full overflow-hidden text-foreground font-sans relative overscroll-none box-border pt-safe',
        isGlass ? 'bg-transparent' : 'bg-background'
      )}
    >
      {isGlass && (
        <div className="aurora-bg" aria-hidden>
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
        </div>
      )}

      {!isGlass && (
        <div
          className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.03] z-0"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
      )}

      {/* Content area */}
      <div className="mx-auto flex h-full w-full max-w-[1600px] gap-0 md:gap-6 md:p-6 relative z-10 pb-[calc(env(safe-area-inset-bottom,0px)+3.75rem)] md:pb-0">

        {/* ═══ SIDEBAR ═══ */}
        <aside
          className={cn(
            'flex flex-col w-full md:w-[400px] md:shrink-0 h-full',
            isGlass ? 'md:glass-card' : 'md:bg-card md:border-4 md:border-foreground md:shadow-[8px_8px_0_var(--foreground)]',
            isReaderOpen && 'hidden md:flex'
          )}
        >
          {/* ── Header ── */}
          <div
            className={cn(
              'header-collapsible shrink-0 relative',
              isGlass
                ? 'border-b border-[var(--glass-border)] bg-[var(--glass-bg)]'
                : 'border-b md:border-b-4 border-foreground/10 md:border-foreground bg-muted/30',
              isHeaderHidden && 'md:header-hidden'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3">
              {/* Left: Title or breadcrumb */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {activeTab === 'browse' && activeCategory ? (
                  <>
                    <button
                      onClick={() => selectCategory(null)}
                      className={cn(
                        'text-sm opacity-60 hover:opacity-100 transition-opacity shrink-0',
                        isGlass ? 'font-medium' : 'font-bold uppercase'
                      )}
                    >
                      ← Wszystkie
                    </button>
                    <span className="opacity-30">/</span>
                    <span className={cn(
                      'text-lg truncate',
                      isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight'
                    )}>
                      {CATEGORY_ICONS[activeCategory]}{' '}
                      {CATEGORY_LABELS[activeCategory] || activeCategory}
                    </span>
                  </>
                ) : activeTab === 'desk' ? (
                  <span className={cn('text-lg', isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight')}>
                    ★ Biurko
                  </span>
                ) : activeTab === 'search' ? (
                  <span className={cn('text-lg', isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight')}>
                    Szukaj
                  </span>
                ) : activeTab === 'theme' ? (
                  <span className={cn('text-lg', isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight')}>
                    Motyw
                  </span>
                ) : (
                  <AuraCrystalLogo scrollProgress={listProgress} />
                )}
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-1 shrink-0">
                {activeTab !== 'theme' && (
                  <button
                    onClick={openSearch}
                    className={cn(
                      'min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors',
                      isGlass ? 'hover:bg-[var(--glass-bg-hover)] rounded-full' : 'hover:bg-muted'
                    )}
                    aria-label="Szukaj"
                  >
                    <Search className="h-5 w-5" strokeWidth={2} />
                  </button>
                )}
                {activeTab === 'browse' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }}
                    className={cn(
                      'min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors relative',
                      isGlass ? 'hover:bg-[var(--glass-bg-hover)] rounded-full' : 'hover:bg-muted'
                    )}
                    aria-label="Sortuj"
                  >
                    <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
                  </button>
                )}
                <div className="hidden md:block">
                  <ThemeSwitcher variant="compact" />
                </div>
              </div>
            </div>

            {/* Sort dropdown — desktop only */}
            {showSortMenu && (
              <div
                className={cn(
                  'hidden md:block absolute right-4 top-14 z-50 min-w-[160px]',
                  isGlass
                    ? 'glass-card rounded-2xl border border-[var(--glass-border)] p-2'
                    : 'bg-card border-2 border-foreground shadow-[4px_4px_0_var(--foreground)] p-2'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(SORT_LABELS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => { setSort(k as SortMode); setShowSortMenu(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      isGlass
                        ? 'hover:bg-[var(--glass-bg-hover)] rounded-xl font-medium'
                        : 'hover:bg-foreground hover:text-background font-bold uppercase',
                      sort === k && (isGlass ? 'bg-[var(--glass-bg-hover)]' : 'bg-foreground text-background')
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            {/* Stat line */}
            {activeTab !== 'theme' && (
              <div className={cn(
                'px-4 pb-2 text-[11px] opacity-50',
                isGlass ? 'font-medium' : 'font-bold uppercase tracking-wider'
              )}>
                {activeTab === 'search' && !debouncedQuery
                  ? 'Wpisz frazę aby szukać'
                  : `${filtered.length} notatek`}
              </div>
            )}
          </div>

          {/* ── Inline search bar ── */}
          <div className={cn("search-bar-wrapper", isSearchOpen ? "is-open" : "")}>
            <div className="search-bar-inner">
              <div className={cn(
                'shrink-0 px-4 py-3',
                isGlass ? 'border-b border-[var(--glass-border)] bg-[var(--glass-bg)]' : 'border-b md:border-b-4 border-foreground/10 md:border-foreground bg-muted/20'
              )}>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" strokeWidth={2} />
                    <Input
                      ref={searchRef}
                      className={cn(
                        'pl-9 h-11 transition-all',
                        isGlass
                          ? 'glass-input rounded-2xl border font-medium'
                          : 'rounded-none bg-background border-2 border-foreground font-bold focus-visible:ring-0 focus-visible:border-primary'
                      )}
                      placeholder={activeCategory ? `Szukaj w ${CATEGORY_LABELS[activeCategory] || activeCategory}...` : 'Szukaj we wszystkich...'}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => { triggerHaptic('light'); closeSearch(); }}
                    className={cn(
                      'min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 transition-colors',
                      isGlass ? 'hover:bg-[var(--glass-bg-hover)] rounded-full' : 'hover:bg-muted'
                    )}
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Category chips (browse, no category selected) ── */}
          {activeTab === 'browse' && !activeCategory && !isSearchOpen && (
            <div className="chip-scroll shrink-0">
              <button
                className={cn('chip', !activeCategory && 'chip-active')}
                onClick={() => selectCategory(null)}
              >
                Wszystkie ({notes.filter(n => n.category !== 'system').length})
              </button>
              {categories.map((cat) => {
                const count = notes.filter((n) => n.category === cat).length;
                return (
                  <button
                    key={cat}
                    className={cn('chip', activeCategory === cat && 'chip-active')}
                    onClick={() => selectCategory(cat)}
                  >
                    {CATEGORY_ICONS[cat] || ''} {CATEGORY_LABELS[cat] || cat} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Tag chips (browse, category selected) ── */}
          {activeTab === 'browse' && activeCategory && !isSearchOpen && tagsForCategory.length > 0 && (
            <div className="chip-scroll shrink-0">
              <button
                className={cn('chip', !activeTag && 'chip-active')}
                onClick={() => setActiveTag(null)}
              >
                Wszystkie
              </button>
              {tagsForCategory.map((t) => (
                <button
                  key={t}
                  className={cn('chip', activeTag === t && 'chip-active')}
                  onClick={() => setActiveTag(t)}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* ── Search tab: always-visible input ── */}
          {activeTab === 'search' && !isSearchOpen && (
            <div className={cn(
              'p-4 shrink-0',
              isGlass ? 'border-b border-[var(--glass-border)]' : 'border-b md:border-b-4 border-foreground/10 md:border-foreground'
            )}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" strokeWidth={2} />
                <Input
                  className={cn(
                    'pl-9 h-11 transition-all',
                    isGlass
                      ? 'glass-input rounded-2xl border font-medium'
                      : 'rounded-none bg-background border-2 border-foreground font-bold focus-visible:ring-0 focus-visible:border-primary'
                  )}
                  placeholder="Szukaj we wszystkich notatkach..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Theme tab ── */}
          {activeTab === 'theme' && (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <ThemeSwitcher variant="preview" />
            </div>
          )}

          {/* ── Note list (browse + desk + search) ── */}
          {activeTab !== 'theme' && (
            <div
              ref={listRef}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-y-contain touch-pan-y relative"
              onTouchStart={(e) => {
                if (listRef.current && listRef.current.scrollTop <= 0) {
                  touchStartY.current = e.touches[0].clientY;
                  pullActive.current = true;
                }
              }}
              onTouchMove={(e) => {
                if (!pullActive.current) return;
                const dy = Math.max(0, e.touches[0].clientY - touchStartY.current);
                // Wzór na fizyczne napięcie (Rubber-banding) P1
                const maxPull = 120;
                const resistance = maxPull * Math.log10(1 + dy / maxPull);
                if (dy > 0) setPullDistance(Math.min(resistance, 90));
              }}
              onTouchEnd={() => {
                if (pullDistance > 50 && pass) {
                  triggerHaptic('medium');
                  setIsRefreshing(true);
                  loadNotes(pass).finally(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                    triggerHaptic('light');
                  });
                } else {
                  setPullDistance(0);
                }
                pullActive.current = false;
              }}
            >
              {/* Pull-to-refresh indicator */}
              {(pullDistance > 0 || isRefreshing) && (
                <div
                  className="flex items-center justify-center text-foreground/60 transition-all overflow-hidden"
                  style={{ height: isRefreshing ? 40 : pullDistance }}
                >
                  <span className={cn(
                    'text-xl transition-transform',
                    isGlass ? 'font-light' : 'font-black',
                    isRefreshing && 'animate-spin',
                    pullDistance > 50 && 'scale-125'
                  )}>★</span>
                </div>
              )}

              {/* Empty states */}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 px-6 text-center">
                  {activeTab === 'desk' ? (
                    <>
                      <Star className="w-12 h-12 opacity-20" strokeWidth={1.5} />
                      <p className={cn('text-lg', isGlass ? 'font-semibold' : 'font-black uppercase')}>Twoje biurko jest puste</p>
                      <p className={cn('text-sm opacity-50', isGlass ? 'font-medium' : 'font-bold uppercase')}>Oznacz notatki ★ aby je tu zobaczyć</p>
                    </>
                  ) : activeTab === 'search' && !debouncedQuery ? (
                    <>
                      <Search className="w-12 h-12 opacity-20" strokeWidth={1.5} />
                      <p className={cn('text-lg', isGlass ? 'font-semibold' : 'font-black uppercase')}>Wpisz szukaną frazę</p>
                      <p className={cn('text-sm opacity-50', isGlass ? 'font-medium' : 'font-bold uppercase')}>Przeszukaj tytuły, treść i tagi</p>
                    </>
                  ) : activeTab === 'search' && debouncedQuery ? (
                    <>
                      <Search className="w-12 h-12 opacity-20" strokeWidth={1.5} />
                      <p className={cn('text-lg', isGlass ? 'font-semibold' : 'font-black uppercase')}>Nie znaleziono „{debouncedQuery}”</p>
                      <p className={cn('text-sm opacity-50', isGlass ? 'font-medium' : 'font-bold uppercase')}>Spróbuj inne słowa kluczowe</p>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-12 h-12 opacity-20" strokeWidth={1.5} />
                      <p className={cn('text-lg', isGlass ? 'font-semibold' : 'font-black uppercase')}>
                        Brak notatek{activeCategory ? ` w ${CATEGORY_LABELS[activeCategory] || activeCategory}` : ''}
                      </p>
                      <p className={cn('text-sm opacity-50', isGlass ? 'font-medium' : 'font-bold uppercase')}>
                        Dodaj pliki .md do memory/ i przebuduj
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Note rows */}
              <div>
                {filtered.map((n, index) => {
                  const snippet = debouncedQuery ? getSnippet(n.content, debouncedQuery.trim()) : null;
                  const excerpt = n.excerpt || (n.plainText ? n.plainText.slice(0, 80) : n.content.replace(/[#*_\[\]]/g, '').slice(0, 80));
                  return (
                    <button
                      key={n.id}
                      style={{ '--delay': index } as React.CSSProperties}
                      onClick={() => { triggerHaptic('light'); openReader(n.id); }}
                      className={cn(
                        'note-row',
                        selectedId === n.id && 'note-row-active'
                      )}
                    >
                      <div className="flex w-full justify-between items-start gap-2">
                        <span className={cn(
                          'line-clamp-1 text-base leading-snug flex-1',
                          isGlass ? 'font-semibold tracking-tight' : 'font-bold tracking-tight'
                        )}>
                          {debouncedQuery ? highlightText(n.title, debouncedQuery.trim()) : n.title}
                        </span>
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(e, n.id); }}
                          className={cn(
                            'shrink-0 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center text-lg',
                            'hover:scale-125 transition-transform active:scale-90',
                            n.isFavorite ? 'opacity-100 text-[#D97A35]' : 'opacity-15 hover:opacity-40'
                          )}
                        >★</div>
                      </div>

                      <p className={cn(
                        'mt-0.5 text-[0.8rem] opacity-50 line-clamp-1',
                        isGlass ? 'font-normal' : 'font-medium'
                      )}>
                        {snippet ? highlightText(snippet, debouncedQuery.trim()) : excerpt}
                      </p>

                      <div className={cn(
                        'mt-1.5 flex items-center gap-2 text-[0.7rem] opacity-40',
                        isGlass ? 'font-medium' : 'font-semibold uppercase tracking-wider'
                      )}>
                        <span>{fmtRelative(n.updatedAt)}</span>
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        <span>{n.readingMinutes} min</span>
                        {activeTab !== 'browse' && n.category && n.category !== 'other' && (
                          <>
                            <span className="w-1 h-1 bg-current rounded-full"></span>
                            <span>{CATEGORY_LABELS[n.category] || n.category}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* ═══ DESKTOP READER ═══ */}
        <main
          className={cn(
            'flex flex-col min-w-0 flex-1 relative overflow-hidden',
            'hidden md:flex',
            isGlass ? 'glass-card' : 'bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)]'
          )}
        >
          {!selected ? (
            <div className={cn(
              'flex flex-col items-center justify-center h-full gap-6',
              isGlass ? 'bg-transparent' : 'bg-muted/10'
            )}>
              <BookOpen className="w-16 h-16 opacity-20" strokeWidth={1.5} />
              <div className="text-center">
                <p className={cn(
                  'text-2xl px-6 py-3',
                  isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-wider'
                )}>Wybierz notatkę</p>
                <p className={cn('mt-3 text-sm opacity-40', isGlass ? 'font-medium' : 'font-bold uppercase')}>
                  {filtered.length} notatek dostępnych
                </p>
              </div>
            </div>
          ) : (
            <ReaderContent
              note={selected}
              readProgress={desktopReadProgress}
              readerScrollY={desktopScrollY}
              readerRef={desktopReaderRef}
              isGlass={isGlass}
              onBack={undefined}
              toggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>

      {/* ═══ MOBILE READER OVERLAY ═══ */}
      {isReaderOpen && selected && (
        <div
          className={cn(
            'fixed inset-0 z-50 md:hidden flex flex-col',
            isGlass ? 'bg-[var(--background)]' : 'bg-background',
            isReaderExiting ? 'reader-exit' : 'reader-enter'
          )}
          {...edgeSwipeHandlers}
        >
          <ReaderContent
            note={selected}
            readProgress={mobileReadProgress}
            readerScrollY={mobileScrollY}
            readerRef={mobileReaderRef}
            isGlass={isGlass}
            onBack={closeReader}
            toggleFavorite={toggleFavorite}
          />
        </div>
      )}

      {/* ═══ BOTTOM NAV ═══ */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 md:hidden',
          isGlass
            ? 'pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] px-4 pt-2 bg-transparent pointer-events-none'
            : 'bg-card border-t-2 border-foreground',
          isReaderOpen ? 'bottom-nav-hide' : 'bottom-nav-show'
        )}
      >
        <div className={cn(
          "bottom-nav-v2 pointer-events-auto",
          isGlass ? "glass-nav rounded-[2rem]" : ""
        )}>
          {([
            { id: 'browse' as AppView, icon: LayoutGrid, label: 'Przegląd' },
            { id: 'desk' as AppView, icon: Star, label: 'Biurko' },
            { id: 'search' as AppView, icon: Search, label: 'Szukaj' },
            { id: 'theme' as AppView, icon: Palette, label: 'Motyw' },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className="bottom-nav-v2-item relative"
              data-active={activeTab === id}
              onClick={() => {
                setActiveTab(id);
                if (id === 'search') setQuery('');
              }}
            >
              <Icon className="h-6 w-6" strokeWidth={activeTab === id ? 2.5 : 1.5} />
              <span className={cn(
                'bottom-nav-v2-label',
                isGlass ? 'tracking-normal normal-case' : 'uppercase tracking-wider'
              )}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ═══ MOBILE SORT BOTTOM SHEET ═══ */}
      {showSortMenu && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowSortMenu(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 pb-safe',
              isGlass
                ? 'bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--glass-border)] rounded-t-3xl'
                : 'bg-card border-t-2 border-foreground'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center py-3">
              <div className={cn('w-10 h-1 rounded-full', isGlass ? 'bg-foreground/20' : 'bg-foreground/30')} />
            </div>
            <div className="px-4 pb-4 space-y-1">
              <p className={cn(
                'text-xs opacity-50 px-3 pb-2',
                isGlass ? 'font-medium' : 'font-bold uppercase tracking-wider'
              )}>Sortuj wg</p>
              {Object.entries(SORT_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => { setSort(k as SortMode); setShowSortMenu(false); }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm transition-colors',
                    isGlass
                      ? 'hover:bg-[var(--glass-bg-hover)] rounded-2xl font-medium'
                      : 'hover:bg-foreground hover:text-background font-bold uppercase',
                    sort === k && (isGlass ? 'bg-[var(--glass-bg-hover)] rounded-2xl' : 'bg-foreground text-background')
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Brutalist paper texture */}
      {!isGlass && <div className="vignette-grain" />}

      {/* Ink spill Easter Egg */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {inkSpills.map(spill => (
          <svg key={spill.id} className="absolute animate-ink-spill origin-center" style={{ left: `${spill.x}%`, top: `${spill.y}%`, width: '150px', height: '150px', fill: 'var(--foreground)', transform: 'translate(-50%, -50%)' }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M 45,5 C 60,3 75,10 85,25 C 95,40 98,60 85,75 C 70,90 50,97 30,85 C 10,75 2,50 10,30 C 15,15 30,8 45,5 Z" />
            <path d="M 15,65 C 5,75 -5,95 10,95 C 25,95 20,70 15,65 Z" />
            <path d="M 85,15 C 95,5 105,10 95,25 C 85,35 75,25 85,15 Z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   READER CONTENT (shared between desktop and mobile)
   ═══════════════════════════════════════════════ */

function ReaderContent({
  note,
  readProgress,
  readerScrollY,
  readerRef,
  isGlass,
  onBack,
  toggleFavorite,
}: {
  note: Note;
  readProgress: number;
  readerScrollY: number;
  readerRef: React.RefObject<HTMLDivElement | null>;
  isGlass: boolean;
  onBack: (() => void) | undefined;
  toggleFavorite: (e: React.MouseEvent, id: string) => void;
}) {
  // Contextual Theming (P3)
  const categoryTint = useMemo(() => {
    if (!isGlass) return 'transparent';
    switch (note.category) {
      case 'fitness-health': return 'rgba(74, 222, 128, 0.05)';
      case 'design': return 'rgba(192, 132, 252, 0.05)';
      case 'golden-protocols': return 'rgba(250, 204, 21, 0.05)';
      case 'ai-agents': return 'rgba(96, 165, 250, 0.05)';
      case 'growth-marketing': return 'rgba(248, 113, 113, 0.05)';
      default: return 'transparent';
    }
  }, [note.category, isGlass]);

  // Scroll-Driven Shadows (P1)
  const shadowOpacity = Math.min(readerScrollY / 50, 0.15);
  const borderOpacity = Math.min(readerScrollY / 20, 0.6);

  return (
    <div className="flex flex-col h-full relative" key={note.id}>
      {/* Contextual gradient background */}
      {isGlass && (
        <div 
          className="absolute inset-0 pointer-events-none transition-colors duration-700 z-0" 
          style={{ background: `radial-gradient(ellipse at top right, ${categoryTint}, transparent 60%)` }}
        />
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 bg-foreground/5">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>

      {/* Header */}
      <div 
        className={cn(
          'flex items-center gap-2 px-4 py-2 shrink-0 header-collapsible relative z-20 transition-shadow',
          isGlass
            ? 'border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl'
            : 'border-b-2 border-foreground/10 bg-muted/20',
          readerScrollY > 100 && !onBack && 'header-hidden'
        )}
        style={isGlass ? {
          boxShadow: `0 4px 24px rgba(0,0,0,${shadowOpacity})`,
          borderBottomColor: `rgba(255,255,255,${borderOpacity * 0.5})`
        } : undefined}
      >
        {onBack && (
          <button
            onClick={() => { triggerHaptic('light'); onBack(); }}
            className={cn(
              'min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors',
              isGlass ? 'hover:bg-[var(--glass-bg-hover)] rounded-full' : 'hover:bg-muted'
            )}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
        <span className={cn(
          'text-sm line-clamp-1 flex-1',
          isGlass ? 'font-semibold tracking-tight' : 'font-bold tracking-tight'
        )}>
          {note.title}
        </span>
        <span className={cn(
          'text-[10px] opacity-40 shrink-0',
          isGlass ? 'font-medium' : 'font-bold uppercase'
        )}>
          {Math.round(readProgress * 100)}%
        </span>
      </div>

      {/* Content */}
      <div
        ref={readerRef}
        className={cn(
          'min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-12 custom-scrollbar selection:bg-foreground selection:text-background overscroll-y-contain touch-pan-y relative z-10',
          isGlass ? 'bg-transparent' : 'bg-background'
        )}
      >
        <article className="markdown-body mx-auto pb-24">
          {/* Note header */}
          <div className={cn('mb-12 pb-6', isGlass ? 'border-b border-[var(--glass-border)]' : 'border-b-2 border-foreground/10')}>
            <h1 className={cn(
              'text-3xl md:text-[2.5rem] leading-[1.1] mb-4 break-words border-none pb-0 flex items-start gap-3',
              isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tighter'
            )}>
              {note.title}
              <button
                onClick={(e) => { triggerHaptic('medium'); toggleFavorite(e, note.id); }}
                className={cn(
                  'mt-1 text-xl hover:scale-125 transition-transform active:scale-90 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0',
                  note.isFavorite ? 'opacity-100 text-[#D97A35]' : 'opacity-20 hover:opacity-60'
                )}
              >★</button>
            </h1>

            <div className={cn(
              'flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] opacity-60 mb-4',
              isGlass ? 'font-medium' : 'font-semibold uppercase tracking-wider'
            )}>
              <span>Utworzono: {fmtRelative(note.createdAt)}</span>
              <span className="w-1 h-1 bg-current rounded-full"></span>
              <span>Akt: {fmtRelative(note.updatedAt)}</span>
              <span className="w-1 h-1 bg-current rounded-full"></span>
              <span>{note.readingMinutes} min czytania</span>
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((t: string) => (
                  <Badge key={t} variant="outline" className={cn(
                    'text-[11px] px-2 py-1',
                    isGlass
                      ? 'rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] font-medium shadow-none'
                      : 'rounded-none border border-foreground/20 uppercase font-bold'
                  )}>#{t}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Markdown content */}
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
            {note.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
