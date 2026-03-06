'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import {
  ArrowLeft, BookOpen, Search, Star, SunMoon, LayoutGrid, ChevronLeft,
  SlidersHorizontal, X, Activity, ShieldCheck, Cpu, Bookmark,
  PenTool, Calendar, TrendingUp, Archive, ChefHat, Sparkles
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

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

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'fitness-health': Activity,
  'golden-protocols': ShieldCheck,
  'ai-agents': Cpu,
  'bookmarks': Bookmark,
  'design': PenTool,
  'daily-log': Calendar,
  'growth-marketing': TrendingUp,
  'outputs': Archive,
  'recipes': ChefHat,
  'taste': Sparkles,
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
    i % 2 === 1 ? <mark key={i} className="bg-primary/30 text-foreground px-0.5 font-bold">{part}</mark> : part
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

function sanitizeTag(tag: string): string | null {
  const normalized = tag.trim();
  return normalized.length > 0 ? normalized : null;
}

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */

export default function Page() {
  const { isGlass } = useTheme();

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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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

    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      const DeviceMotionCtor = window.DeviceMotionEvent as DeviceMotionEventWithPermission;
      if (typeof DeviceMotionCtor.requestPermission === 'function') {
        return;
      }
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, []);

  /* ── Data loading ── */

  async function loadNotes(password: string) {
    const normalizedPassword = password.trim();
    setLoading(true);
    setLoginError('');
    try {
      const endpoint = process.env.NODE_ENV === 'development' ? '/api/notes' : '/.netlify/functions/notes';
      const res = await fetch(endpoint, { headers: { 'x-aura-pass': normalizedPassword } });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) { setLoginError('Błędne hasło.'); return; }
      if (!res.ok || !json.ok) { setLoginError(json.error || 'Błąd API notatek'); return; }
      setUnlocking(true);
      await new Promise(r => setTimeout(r, 400));
      setPass(normalizedPassword);
      setToken(normalizedPassword);
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
    base.forEach((n) => {
      (n.tags || []).forEach((t) => {
        const normalized = sanitizeTag(t);
        if (normalized) set.add(normalized);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [notes, activeCategory]);

  const tagCountsForCategory = useMemo(() => {
    const counts = new Map<string, number>();
    const base = activeCategory
      ? notes.filter((n) => n.category === activeCategory)
      : notes.filter((n) => n.category !== 'system');

    base.forEach((n) => {
      const uniqueTags = new Set<string>();
      (n.tags || []).forEach((t) => {
        const normalized = sanitizeTag(t);
        if (normalized) uniqueTags.add(normalized);
      });

      uniqueTags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });

    return counts;
  }, [notes, activeCategory]);

  const notesInActiveCategory = useMemo(() => {
    if (activeCategory) {
      return notes.filter((n) => n.category === activeCategory && n.category !== 'system').length;
    }
    return notes.filter((n) => n.category !== 'system').length;
  }, [notes, activeCategory]);

  const isBrowseChipRowVisible = activeTab === 'browse' && !isSearchOpen && (!activeCategory || tagsForCategory.length > 0);

  const updateRowSpotlight = useCallback((el: HTMLButtonElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spotlight-x', `${clientX - rect.left}px`);
    el.style.setProperty('--spotlight-y', `${clientY - rect.top}px`);
    el.dataset.spotlight = 'true';
  }, []);

  const clearRowSpotlight = useCallback((el: HTMLButtonElement) => {
    el.dataset.spotlight = 'false';
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const out = notes.filter((n) => {
      const normalizedTags = (n.tags || [])
        .map(sanitizeTag)
        .filter((tag): tag is string => Boolean(tag));

      if (activeTab === 'desk') return n.isFavorite;
      if (activeTab === 'search') {
        if (!q) return false;
        if (n.category === 'system') return false;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          normalizedTags.some((t) => t.toLowerCase().includes(q)) ||
          n.category.toLowerCase().includes(q)
        );
      }
      // Browse tab
      if (n.category === 'system') return false;
      if (activeCategory && n.category !== activeCategory) return false;
      if (activeTag && !normalizedTags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        normalizedTags.some((t) => t.toLowerCase().includes(q))
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
        "aura-theme-scope flex min-h-[100svh] min-h-dvh w-full max-w-full flex-col items-center justify-center p-5 relative overflow-hidden box-border pt-safe transition-all duration-[400ms]",
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

        {!isGlass && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        )}
        <div className={cn(
          "login-auth-card w-full max-w-md p-6 sm:p-8 relative z-10 overflow-hidden",
          isGlass
            ? "glass-card"
            : "rounded-[2rem] border border-foreground/15 bg-card/95 shadow-[0_24px_70px_rgba(7,15,30,0.18)] backdrop-blur-md"
        )}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl" />
          </div>

          <div className="relative">
            <div className="mb-6 flex items-center justify-between gap-3">
              <AuraCrystalLogo className="shrink-0" />
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] tracking-wide",
                isGlass
                  ? "border border-[var(--glass-border)] bg-[var(--glass-bg)] font-medium text-foreground/80"
                  : "border border-foreground/15 bg-background/70 font-semibold text-foreground/70"
              )}>
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                Secure Access
              </span>
            </div>

            <div className="space-y-2 text-left">
              <h1 className={cn(
                "text-[1.9rem] leading-[1.1] tracking-tight",
                isGlass ? "font-semibold" : "font-bold"
              )}>
                Odblokuj Aura Notes
              </h1>
              <p className={cn(
                "text-[0.95rem] leading-relaxed",
                isGlass ? "text-foreground/70" : "text-foreground/72"
              )}>
                Wprowadź hasło główne, aby otworzyć zaszyfrowane notatki i wrócić do pracy.
              </p>
            </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              loadNotes(loginInput);
            }}
          >
            <label className={cn(
              "block text-left text-[0.76rem] uppercase tracking-[0.18em]",
              isGlass ? "text-foreground/62" : "text-foreground/55"
            )}>
              Hasło główne
            </label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-55" strokeWidth={2.2} />
              <input
                type="password"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Wpisz hasło..."
                className={cn(
                  "login-auth-input h-12 w-full pl-10 pr-4 text-left transition-all outline-none",
                  isGlass ? "font-medium tracking-tight" : "font-medium",
                  isGlass
                    ? "glass-input rounded-2xl border border-foreground/30 dark:border-white/20"
                    : "rounded-2xl bg-background/88 border border-foreground/20 focus-visible:ring-0 focus-visible:border-primary/65 focus-visible:bg-background"
                )}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "login-auth-button group w-full h-12 transition-all outline-none inline-flex items-center justify-center gap-2",
                isGlass
                  ? "glass-button glass-button-primary rounded-2xl border"
                  : "rounded-2xl border border-transparent bg-foreground text-background hover:brightness-110 active:brightness-95"
              )}
            >
              <span className={cn("text-[0.95rem]", isGlass ? "font-semibold" : "font-semibold tracking-tight")}>
                {loading ? 'Odblokowywanie...' : 'Wejdź do panelu'}
              </span>
              <span className={cn("transition-transform", !loading && "group-hover:translate-x-0.5")}>→</span>
            </button>
            {loginError && (
              <p className={cn("text-sm text-destructive mt-1 text-left", isGlass ? "font-medium" : "font-semibold")}>
                {loginError}
              </p>
            )}
          </form>

            <p className={cn(
              "mt-5 text-[0.78rem] leading-relaxed text-left",
              isGlass ? "text-foreground/60" : "text-foreground/55"
            )}>
              Dane są odszyfrowywane lokalnie na urządzeniu. Bez poprawnego hasła dostęp do notatek pozostaje zablokowany.
            </p>
          </div>
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
      data-glass-theme={isGlass ? 'true' : 'false'}
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
      <div className="mx-auto flex h-full w-full max-w-[1600px] gap-0 md:gap-6 md:p-6 relative z-10 pb-nav-safe">

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
              isBrowseChipRowVisible && 'header-with-pills',
              isGlass
                ? 'bg-[var(--glass-bg)]'
                : 'border-b md:border-b-4 border-foreground/10 md:border-foreground bg-muted/30',
              isGlass && !isBrowseChipRowVisible && 'border-b border-[var(--glass-border)]',
              isHeaderHidden && 'md:header-hidden'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3">
              {/* Left: Title or breadcrumb */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {activeTab === 'browse' ? (
                  <>
                    <AuraCrystalLogo scrollProgress={listProgress} className="shrink-0" />
                    {activeCategory && (
                      <>
                        <button
                          onClick={() => selectCategory(null)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition-colors shrink-0',
                            isGlass ? 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] font-medium' : 'border-foreground/20 bg-background/70 font-bold uppercase'
                          )}
                          aria-label="Pokaż wszystkie kategorie"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                          Wszystkie
                        </button>
                        <span className="opacity-30">/</span>
                        <span className={cn(
                          'inline-flex items-center gap-1.5 text-sm truncate',
                          isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight'
                        )}>
                          {(() => {
                            const ActiveIcon = CATEGORY_ICONS[activeCategory];
                            return ActiveIcon ? <ActiveIcon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} /> : null;
                          })()}
                          <span className="truncate">{CATEGORY_LABELS[activeCategory] || activeCategory}</span>
                        </span>
                      </>
                    )}
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
                ) : null}
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
            <div className="chip-scroll chip-scroll-categories shrink-0">
              <span className="chip-scroll-spacer" aria-hidden />
              <button
                className={cn('chip', !activeCategory && 'chip-active')}
                onClick={() => {
                  triggerHaptic('light');
                  selectCategory(null);
                }}
                aria-pressed={!activeCategory}
              >
                Wszystkie ({notes.filter(n => n.category !== 'system').length})
              </button>
              {categories.map((cat) => {
                const count = notes.filter((n) => n.category === cat).length;
                const CategoryIcon = CATEGORY_ICONS[cat];
                return (
                  <button
                    key={cat}
                    className={cn('chip', activeCategory === cat && 'chip-active')}
                    onClick={() => {
                      triggerHaptic('light');
                      selectCategory(cat);
                    }}
                    aria-pressed={activeCategory === cat}
                  >
                    {CategoryIcon ? <CategoryIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} /> : null}
                    <span className="truncate">{CATEGORY_LABELS[cat] || cat}</span>
                    <span>({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Tag chips (browse, category selected) ── */}
          {activeTab === 'browse' && activeCategory && !isSearchOpen && tagsForCategory.length > 0 && (
            <div className="chip-scroll shrink-0">
              <span className="chip-scroll-spacer" aria-hidden />
              <button
                className={cn('chip', !activeTag && 'chip-active')}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTag(null);
                }}
                aria-pressed={!activeTag}
              >
                Wszystkie ({notesInActiveCategory})
              </button>
              {tagsForCategory.map((t) => (
                <button
                  key={t}
                  className={cn('chip', activeTag === t && 'chip-active')}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTag(t);
                  }}
                  aria-pressed={activeTag === t}
                >
                  #{t} ({tagCountsForCategory.get(t) ?? 0})
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
                const maxPull = 96;
                const resistance = maxPull * Math.log10(1 + dy / 18);
                if (dy > 0) setPullDistance(Math.min(resistance, maxPull));
              }}
              onTouchEnd={() => {
                if (pullDistance > 42 && pass) {
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
              <div className="note-list">
                {filtered.map((n, index) => {
                  const snippet = debouncedQuery ? getSnippet(n.content, debouncedQuery.trim()) : null;
                  const excerpt = n.excerpt || (n.plainText ? n.plainText.slice(0, 120) : n.content.replace(/[#*_\[\]]/g, '').slice(0, 120));
                  return (
                    <button
                      key={n.id}
                      style={{ '--delay': index } as React.CSSProperties}
                      onClick={() => { triggerHaptic('light'); openReader(n.id); }}
                      onPointerEnter={(e) => updateRowSpotlight(e.currentTarget, e.clientX, e.clientY)}
                      onPointerMove={(e) => updateRowSpotlight(e.currentTarget, e.clientX, e.clientY)}
                      onPointerLeave={(e) => clearRowSpotlight(e.currentTarget)}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        if (touch) updateRowSpotlight(e.currentTarget, touch.clientX, touch.clientY);
                      }}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        if (touch) updateRowSpotlight(e.currentTarget, touch.clientX, touch.clientY);
                      }}
                      onTouchEnd={(e) => clearRowSpotlight(e.currentTarget)}
                      onTouchCancel={(e) => clearRowSpotlight(e.currentTarget)}
                      className={cn(
                        'note-row',
                        selectedId === n.id && 'note-row-active'
                      )}
                      title={n.title}
                    >
                      <div className="flex w-full justify-between items-start gap-2">
                        <span className={cn(
                          'line-clamp-2 text-[0.95rem] leading-snug flex-1',
                          isGlass ? 'font-semibold tracking-tight' : 'font-bold tracking-tight'
                        )}>
                          {debouncedQuery ? highlightText(n.title, debouncedQuery.trim()) : n.title}
                        </span>
                        <div
                          onClick={(e) => { triggerHaptic('light'); e.stopPropagation(); toggleFavorite(e, n.id); }}
                          className={cn(
                            'shrink-0 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center',
                            'transition-transform active:scale-90',
                            n.isFavorite ? 'text-[#D97A35]' : 'text-foreground/40 hover:text-foreground/65'
                          )}
                          title={n.isFavorite ? 'Usuń z biurka' : 'Dodaj do biurka'}
                        >
                          <Star
                            className="h-5 w-5"
                            strokeWidth={1.9}
                            fill={n.isFavorite ? 'currentColor' : 'none'}
                          />
                        </div>
                      </div>

                      <p className={cn(
                        'mt-1 text-[0.82rem] leading-snug line-clamp-2',
                        isGlass ? 'font-normal text-foreground/78' : 'font-medium text-foreground/72'
                      )}>
                        {snippet ? highlightText(snippet, debouncedQuery.trim()) : excerpt}
                      </p>

                      <div className={cn(
                        'mt-1.5 flex items-center gap-2 text-[0.68rem]',
                        isGlass ? 'font-medium text-foreground/56' : 'font-semibold uppercase tracking-wider text-foreground/56'
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
        data-glass={isGlass ? 'true' : 'false'}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 md:hidden mobile-bottom-nav',
          isGlass
            ? 'px-4 pt-2 bg-transparent pointer-events-none'
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
            { id: 'desk' as AppView, icon: Star, label: 'Biurko', fillOnActive: true },
            { id: 'search' as AppView, icon: Search, label: 'Szukaj' },
            { id: 'theme' as AppView, icon: SunMoon, label: 'Motyw' },
          ]).map(({ id, icon: Icon, label, fillOnActive }) => (
            <button
              key={id}
              className="bottom-nav-v2-item relative"
              data-active={activeTab === id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(id);
                if (id === 'search') setQuery('');
              }}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={activeTab === id ? 2.5 : 1.5}
                fill={fillOnActive && activeTab === id ? 'currentColor' : 'none'}
              />
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
      case 'fitness-health': return 'rgba(74, 222, 128, 0.16)';
      case 'design': return 'rgba(192, 132, 252, 0.16)';
      case 'golden-protocols': return 'rgba(250, 204, 21, 0.13)';
      case 'ai-agents': return 'rgba(96, 165, 250, 0.16)';
      case 'growth-marketing': return 'rgba(248, 113, 113, 0.16)';
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
          style={{
            background: `
              radial-gradient(120% 85% at 92% -8%, ${categoryTint} 0%, transparent 68%),
              radial-gradient(140% 90% at -20% 130%, rgba(255,255,255,0.08) 0%, transparent 72%)
            `
          }}
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
          onBack && 'reader-header-safe',
          isGlass && 'reader-header-glass',
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
                  'mt-1 transition-transform active:scale-90 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0',
                  note.isFavorite ? 'text-[#D97A35]' : 'text-foreground/45 hover:text-foreground/72'
                )}
                aria-label={note.isFavorite ? 'Usuń z biurka' : 'Dodaj do biurka'}
                aria-pressed={note.isFavorite === true}
              >
                <Star
                  className="h-5 w-5"
                  strokeWidth={1.9}
                  fill={note.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
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
                {note.tags
                  .map((t: string) => sanitizeTag(t))
                  .filter((t): t is string => Boolean(t))
                  .map((t: string) => (
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
