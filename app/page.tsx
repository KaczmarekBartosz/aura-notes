'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, BookOpen, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NotesPayload } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDebounce, useScrollProgress } from '@/lib/hooks';
import { useTheme } from '@/lib/theme';
import { ThemeSwitcher } from '@/components/glass';

type SortMode = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'title_asc';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? 'local';

const SORT_LABELS: Record<SortMode, string> = {
  updated_desc: 'Akt. ↓',
  updated_asc: 'Akt. ↑',
  created_desc: 'Utw. ↓',
  created_asc: 'Utw. ↑',
  title_asc: 'A-Z',
};

const RESERVED_FILTERS = new Set(['all', 'main', 'biurko', 'system']);

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

function fmt(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Page() {
  const { theme, isGlass } = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [pass, setPass] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<NotesPayload | null>(null);

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [sort, setSort] = useState<SortMode>('updated_desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'read'>('list');
  const [dogAnim, setDogAnim] = useState(false);

  const [inkSpills, setInkSpills] = useState<{ id: number; x: number; y: number }[]>([]);

  /* ── Optimization state ── */
  const [unlocking, setUnlocking] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ── Refs ── */
  const readerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const touchStartY = useRef(0);
  const pullActive = useRef(false);

  /* ── Debounced search (opt #10) ── */
  const debouncedQuery = useDebounce(query, 150);

  /* ── Scroll progress for reader (opt #6) ── */
  const { progress: readProgress, scrollY: readerScrollY } = useScrollProgress(readerRef);

  /* ── Handlers ── */

  function handleSelectNote(id: string) {
    setSelectedId(id);
    readerRef.current?.scrollTo(0, 0); // opt #2: scroll-to-top
    if (window.innerWidth < 768) setMobileTab('read');
  }

  function handleTabChange(tab: 'list' | 'read') {
    setMobileTab(tab);
  }

  /* ── Effects ── */

  // Ink spill Easter egg
  useEffect(() => {
    let lastTime = 0;

    function handleMotion(e: DeviceMotionEvent) {
      if (!e.accelerationIncludingGravity) return;
      const { x, y, z } = e.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      const acceleration = Math.sqrt(x*x + y*y + z*z);

      if (acceleration > 20) {
        const now = Date.now();
        if (now - lastTime > 1000) {
          lastTime = now;
          setInkSpills(prev => [...prev, {
            id: now,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10
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
      if (res.status === 401) {
        setLoginError('Błędne hasło.');
        return;
      }
      if (!res.ok || !json.ok) {
        setLoginError(json.error || 'Błąd API notatek');
        return;
      }
      // opt #9: unlock transition
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

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (payload) {
      setPayload({
        ...payload,
        notes: payload.notes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)
      });
    }
  };

  const tags = useMemo(() => {
    const set = new Set<string>();
    notes
      .filter((n) => n.category !== 'system')
      .forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [notes]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    notes
      .filter((n) => n.category !== 'system' && n.category !== 'other')
      .forEach((n) => set.add(n.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [notes]);

  const systemCount = useMemo(() => notes.filter((n) => n.category === 'system').length, [notes]);
  const mainCount = useMemo(() => notes.filter((n) => n.category !== 'system').length, [notes]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let out = notes.filter((n) => {
      const isSystem = n.category === 'system';

      if (activeTag === 'system' && !isSystem) return false;
      if (activeTag === 'main' && isSystem) return false;

      if (activeTag === 'biurko' && !n.isFavorite) return false;

      // Filtrowanie po kategorii (jeśli activeTag to nazwa kategorii)
      if (!RESERVED_FILTERS.has(activeTag) && categories.includes(activeTag)) {
        return n.category === activeTag;
      }

      // Filtrowanie po tagu
      if (!RESERVED_FILTERS.has(activeTag) && !(n.tags || []).includes(activeTag)) return false;

      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.path.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        n.category.toLowerCase().includes(q)
      );
    });

    out = out.sort((a, b) => {
      switch (sort) {
        case 'updated_asc':
          return +new Date(a.updatedAt) - +new Date(b.updatedAt);
        case 'created_desc':
          return +new Date(b.createdAt || b.updatedAt) - +new Date(a.createdAt || a.updatedAt);
        case 'created_asc':
          return +new Date(a.createdAt || a.updatedAt) - +new Date(b.createdAt || b.updatedAt);
        case 'title_asc':
          return a.title.localeCompare(b.title, 'pl');
        case 'updated_desc':
        default:
          return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      }
    });

    return out;
  }, [notes, activeTag, debouncedQuery, sort]);

  const selected = filtered.find((n) => n.id === selectedId) || notes.find((n) => n.id === selectedId) || null;


  // opt #11: keyboard shortcuts (must be after filtered is defined)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (mobileTab === 'read') setMobileTab('list');
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = filtered.findIndex(n => n.id === selectedId);
        const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
        if (next >= 0 && next < filtered.length) {
          setSelectedId(filtered[next].id);
          readerRef.current?.scrollTo(0, 0);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedId, mobileTab]);

  /* ── Search highlight helpers (opt #10) ── */

  function highlightText(text: string, q: string): React.ReactNode {
    if (!q.trim()) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-primary/30 text-foreground px-0.5 font-black">{part}</mark> : part
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

  /* ── Pull-to-refresh handlers (opt #7) ── */

  function handlePullStart(e: React.TouchEvent) {
    if (listRef.current && listRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      pullActive.current = true;
    }
  }

  function handlePullMove(e: React.TouchEvent) {
    if (!pullActive.current) return;
    const dy = Math.max(0, e.touches[0].clientY - touchStartY.current);
    if (dy > 0) setPullDistance(Math.min(dy * 0.5, 80));
  }

  function handlePullEnd() {
    if (pullDistance > 50 && pass) {
      setIsRefreshing(true);
      loadNotes(pass).finally(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
    pullActive.current = false;
  }

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

        <div className="absolute top-4 right-4 z-30">
          <ThemeSwitcher variant="compact" />
        </div>

        {/* Duck Hunt Dog in retro TV */}
        <button
          onClick={() => {
            setDogAnim(true);
            setTimeout(() => setDogAnim(false), 300);
          }}
          className={cn(
            "absolute bottom-4 right-4 md:bottom-8 md:right-8 origin-bottom hover:scale-105 transition-transform duration-200 pointer-events-auto z-20 cursor-pointer border-none bg-transparent outline-none focus:outline-none flex flex-col items-center",
            dogAnim && "dog-clicked"
          )}
          title="Duck Hunt Mascot!"
        >
          {/* Antena TV */}
          <div className="flex gap-4 md:gap-8 mb-[-2px] z-0">
            <div className="w-1.5 h-8 md:w-2 md:h-14 bg-foreground origin-bottom rotate-[30deg]"></div>
            <div className="w-1.5 h-6 md:w-2 md:h-10 bg-foreground origin-bottom -rotate-[20deg]"></div>
          </div>

          {/* Obudowa TV */}
          <div className="relative w-48 h-40 md:w-72 md:h-64 bg-foreground p-3 md:p-5 shadow-[8px_8px_0_var(--foreground)/50] flex">

            {/* Ekran TV */}
            <div className="relative flex-1 bg-[#8b9bb4] overflow-hidden border-2 md:border-4 border-background/20 rounded-sm flex items-center justify-center">

              {/* Scanlines i cień kineskopu */}
              <div className="absolute inset-0 bg-black/10 rounded-full blur-md md:blur-xl z-10 pointer-events-none scale-110"></div>
              <div className="absolute inset-0 pointer-events-none z-10 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>

              {/* Obraz Psa */}
              <img src="/duck_hunt_dog.png" alt="Duck Hunt Mascot" className="w-[130%] h-[130%] object-contain pointer-events-none relative z-0 pt-3 md:pt-6 drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
            </div>

            {/* Panel boczny TV */}
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

          {/* Nóżki TV */}
          <div className="flex w-full justify-between px-6 md:px-10 mt-[-2px] z-0">
            <div className="w-3 h-4 md:w-5 md:h-6 bg-foreground skew-x-12"></div>
            <div className="w-3 h-4 md:w-5 md:h-6 bg-foreground -skew-x-12"></div>
          </div>
        </button>

        {/* Dot pattern overlay - only in brutalist mode */}
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
            isGlass ? "font-semibold" : "font-black uppercase"
          )}>Aura Notes</h1>
          <p className={cn(
            "text-sm opacity-60 mb-8",
            isGlass ? "font-medium tracking-normal" : "font-bold uppercase tracking-widest"
          )}>Bezpieczny sejf</p>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              loadNotes(loginInput);
            }}
          >
            <Input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Wprowadź hasło..."
              className={cn(
                "login-auth-input h-12 text-center transition-all",
                isGlass ? "font-sans" : "font-mono",
                isGlass
                  ? "glass-input rounded-2xl border"
                  : "rounded-none bg-background border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[4px_4px_0_var(--primary)]"
              )}
            />
            <Button
              type="submit"
              className={cn(
                "login-auth-button w-full h-12 transition-all font-black text-lg",
                isGlass
                  ? "glass-button glass-button-primary rounded-2xl border"
                  : "rounded-none border-2 border-transparent hover:border-foreground hover:shadow-[4px_4px_0_var(--foreground)] hover:bg-primary hover:brightness-[1.03] uppercase"
              )}
            >
              {loading ? 'Odblokowywanie...' : 'Odblokuj'}
            </Button>
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
    <div className={cn(
      "aura-theme-scope h-[100dvh] min-h-[100svh] w-full max-w-full overflow-hidden text-foreground font-sans relative overscroll-none box-border pt-safe",
      isGlass ? "bg-transparent" : "bg-background"
    )}>
      {isGlass && (
        <div className="aurora-bg" aria-hidden>
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
        </div>
      )}

      {/* Dot pattern overlay - only in brutalist mode */}
      {!isGlass && (
        <div className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      )}

      <div className="mx-auto flex h-full w-full max-w-[1600px] gap-6 p-4 md:p-8 relative z-10 overflow-hidden">

        {/* ── SIDEBAR / NOTE LIST ── */}
        <aside className={cn(
          'flex flex-col w-full md:w-[400px] md:shrink-0',
          isGlass
            ? 'glass-card'
            : 'bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)] hover:shadow-[12px_12px_0_var(--foreground)]',
          mobileTab === 'read' && 'hidden md:flex'
        )}>
          <div className={cn(
            "p-4 md:p-5",
            isGlass ? "border-b border-[var(--glass-border)] bg-[var(--glass-bg)]" : "border-b-4 border-foreground bg-muted/30"
          )}>
            <div className="mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className={cn("text-2xl tracking-tight", isGlass ? "font-semibold" : "font-black uppercase")}>Aura Notes</h2>
                <Badge variant="secondary" className={cn(
                  isGlass ? "font-sans" : "font-mono",
                  "text-[10px] px-1.5",
                  isGlass ? "rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)]" : "rounded-none border-2 border-foreground"
                )}>{APP_VERSION}</Badge>
                <Badge variant="outline" className={cn(
                  "text-[10px] px-1.5",
                  isGlass ? "rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)]" : "rounded-none border-2 border-foreground"
                )}>{theme}</Badge>
              </div>
              <ThemeSwitcher variant="compact" />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity" strokeWidth={3} />
                <Input
                  ref={searchRef}
                  className={cn(
                    "pl-9 h-11 transition-all font-bold",
                    isGlass
                      ? "glass-input rounded-2xl border"
                      : "rounded-none bg-background border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[4px_4px_0_var(--primary)]"
                  )}
                  placeholder="Szukaj notatek... ( / )"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
                <SelectTrigger className={cn(
                  "h-11 w-[110px] text-sm font-bold transition-all",
                  isGlass
                    ? "glass-input rounded-2xl border"
                    : "rounded-none bg-background border-2 border-foreground focus:ring-0 focus:border-primary focus:shadow-[4px_4px_0_var(--primary)]"
                )}>
                  <SelectValue placeholder="Sortuj" />
                </SelectTrigger>
                <SelectContent className={cn(
                  isGlass
                    ? "glass-card rounded-2xl border"
                    : "rounded-none border-2 border-foreground shadow-[4px_4px_0_var(--foreground)] bg-background"
                )}>
                  {Object.entries(SORT_LABELS).map(([k, v]) => (
                    <SelectItem
                      value={k}
                      key={k}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isGlass
                          ? "font-semibold normal-case hover:bg-[var(--glass-bg-hover)]"
                          : "font-bold uppercase hover:bg-foreground hover:text-background"
                      )}
                    >
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className={cn(
              "mt-4 text-[12px] opacity-60 px-1",
              isGlass ? "font-medium tracking-normal" : "font-bold uppercase tracking-wider"
            )}>
              {filtered.length} notatek • Synchr.: {fmt(payload?.generatedAt)}
            </p>
          </div>

          {/* Tag chips — opt #3: touch targets improved via CSS media query */}
          <div className={cn(
            "flex flex-wrap gap-2 p-3 shrink-0",
            isGlass ? "border-b border-[var(--glass-border)] bg-[var(--glass-bg)]" : "border-b-4 border-foreground bg-muted/10"
          )}>
            <button className={cn('chip', activeTag === 'all' && 'chip-active')} onClick={() => setActiveTag('all')}>Wszystkie ({notes.length})</button>
            <button className={cn('chip', activeTag === 'main' && 'chip-active')} onClick={() => setActiveTag('main')}>Główne ({mainCount})</button>
            <button className={cn('chip border-primary text-primary hover:bg-primary/10', activeTag === 'biurko' && 'chip-active bg-primary text-primary-foreground')} onClick={() => setActiveTag('biurko')}>★ Biurko</button>
            {systemCount > 0 && (
              <button
                className={cn('chip border-foreground/70 bg-muted/40', activeTag === 'system' && 'chip-active')}
                onClick={() => setActiveTag('system')}
              >
                System ({systemCount})
              </button>
            )}
            {/* Kategorie */}
            {categories.map((cat) => {
              const count = notes.filter(n => n.category === cat).length;
              return (
                <button
                  key={cat}
                  className={cn(
                    'chip',
                    !isGlass && 'border-l-4 border-l-primary bg-primary/5',
                    activeTag === cat && 'chip-active'
                  )}
                  onClick={() => setActiveTag(cat)}
                  title={`Kategoria: ${cat}`}
                >
                  {CATEGORY_LABELS[cat] || cat} ({count})
                </button>
              );
            })}
            {/* Tagi */}
            {tags.map((t) => (
              <button key={t} className={cn('chip', activeTag === t && 'chip-active')} onClick={() => setActiveTag(t)}>
                #{t}
              </button>
            ))}
          </div>

          {/* Note list — opt #7: pull-to-refresh, pb-28 for bottom nav clearance */}
          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 pb-28 md:pb-3 custom-scrollbar overscroll-y-contain touch-pan-y relative"
            onTouchStart={handlePullStart}
            onTouchMove={handlePullMove}
            onTouchEnd={handlePullEnd}
          >
            {/* Pull-to-refresh indicator */}
            {(pullDistance > 0 || isRefreshing) && (
              <div
                className="flex items-center justify-center text-foreground/60 transition-all overflow-hidden"
                style={{ height: isRefreshing ? 40 : pullDistance }}
              >
                <span className={cn(
                  "text-xl font-black transition-transform",
                  isRefreshing && "animate-spin",
                  pullDistance > 50 && "scale-125"
                )}>★</span>
              </div>
            )}

            <div className="grid gap-1">
              {filtered.map((n) => {
                const snippet = debouncedQuery ? getSnippet(n.content, debouncedQuery.trim()) : null;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelectNote(n.id)}
                    className={cn(
                      'note-btn text-left group border-b-2 border-foreground/10 flex flex-col',
                      'active:scale-[0.98] transition-all', // opt #5: micro-animation
                      !isGlass && 'hover:px-5',
                      selectedId === n.id && cn(
                        'note-btn-active',
                        !isGlass && 'bg-primary text-primary-foreground border-transparent border-l-8 border-l-foreground'
                      )
                    )}
                  >
                    <div className="flex w-full justify-between items-start gap-2">
                      {/* opt #10: highlighted title when searching */}
                      <div className={cn(
                        "line-clamp-2 text-lg leading-snug transition-all flex-1",
                        isGlass ? "font-semibold tracking-tight" : "font-black uppercase tracking-tight group-hover:tracking-normal"
                      )}>
                        {debouncedQuery ? highlightText(n.title, debouncedQuery.trim()) : n.title}
                      </div>
                      {/* opt #3: 44x44px touch target for favorite star */}
                      <div
                        onClick={(e) => toggleFavorite(e, n.id)}
                        className={cn(
                          "shrink-0 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center text-lg",
                          "hover:scale-125 transition-transform active:scale-90",
                          n.isFavorite ? "opacity-100 text-[#D97A35]" : "opacity-20 hover:opacity-60"
                        )}
                      >★</div>
                    </div>

                    {/* opt #10: search snippet with highlight */}
                    {snippet && (
                      <p className={cn("mt-1 text-[0.75rem] opacity-70 line-clamp-1", isGlass ? "font-sans" : "font-mono")}>
                        {highlightText(snippet, debouncedQuery.trim())}
                      </p>
                    )}

                    <div className={cn(
                      "mt-2 flex items-center gap-2 text-[0.75rem] opacity-70 group-hover:opacity-100 w-full flex-wrap",
                      isGlass ? "font-medium tracking-normal" : "font-bold uppercase tracking-widest"
                    )}>
                      <span>{fmt(n.updatedAt)}</span>
                      <span className="w-1.5 h-1.5 bg-current opacity-40"></span>
                      <span>{n.readingMinutes} min czytania</span>
                      {/* opt #13: category badge */}
                      {n.category && n.category !== 'other' && (
                        <>
                          <span className="w-1.5 h-1.5 bg-current opacity-40"></span>
                          <span className="bg-foreground/10 px-1.5 py-0.5 text-[10px]">{n.category}</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── READER / MAIN CONTENT ── */}
        <main className={cn(
          'flex flex-col min-w-0 flex-1 relative overflow-hidden',
          isGlass
            ? 'glass-card'
            : 'bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)]',
          mobileTab === 'list' && 'hidden md:flex'
        )}>

          {/* opt #6: reading progress bar */}
          {selected && (
            <div className="absolute top-0 left-0 right-0 h-[3px] z-30 bg-foreground/10">
              <div
                className="h-full bg-primary transition-[width] duration-150 ease-out"
                style={{ width: `${readProgress * 100}%` }}
              />
            </div>
          )}

          {/* opt #4: typographic empty state */}
          {!selected ? (
            <div className={cn(
              "flex flex-col items-center justify-center h-full opacity-80 gap-6",
              isGlass ? "bg-transparent" : "bg-muted/10"
            )}>
              <BookOpen className="w-20 h-20 stroke-[1.5] opacity-30" />
              <div className="text-center">
                <p className={cn(
                "text-3xl px-6 py-3",
                isGlass
                  ? "font-bold tracking-tight glass-card inline-block"
                  : "font-black uppercase tracking-[0.2em] bg-foreground text-background shadow-[8px_8px_0_var(--primary)] rotate-1"
              )}>Wybierz notatkę</p>
                <p className={cn("mt-4 text-sm opacity-50", isGlass ? "font-medium tracking-normal" : "font-bold uppercase tracking-widest")}>{filtered.length} notatek dostępnych</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full" key={selected.id}>
              {/* Mobile back header — shows note title */}
              <div className={cn(
                "md:hidden p-3 flex items-center justify-between shrink-0",
                isGlass ? "border-b border-[var(--glass-border)] bg-[var(--glass-bg)]" : "border-b-4 border-foreground bg-muted/10"
              )}>
                <Button variant="ghost" size="icon" onClick={() => handleTabChange('list')} className={cn(
                  isGlass
                    ? "glass-button rounded-full border"
                    : "rounded-none border-2 border-foreground hover:bg-foreground hover:text-background shadow-[4px_4px_0_var(--foreground)] active:scale-90 active:shadow-none"
                )}>
                  <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                </Button>
                <span className={cn(
                  "text-sm text-center line-clamp-1 max-w-[60%] px-3 py-1.5",
                  isGlass
                    ? "glass-badge rounded-full font-semibold"
                    : "font-black uppercase tracking-wider bg-foreground text-background shadow-[4px_4px_0_var(--primary)]"
                )}>
                  {selected.title}
                </span>
              </div>

              {/* opt #6: sticky header on desktop (appears after scrolling 150px) */}
              <div className={cn(
                "hidden md:flex items-center justify-between px-6 py-2 shrink-0 transition-all duration-200",
                isGlass ? "border-b border-[var(--glass-border)] bg-[var(--glass-bg)]" : "border-b-4 border-foreground bg-muted/30",
                readerScrollY > 150 ? "opacity-100 max-h-16" : "opacity-0 max-h-0 overflow-hidden py-0 border-b-0"
              )}>
                <span className={cn(
                  "text-sm line-clamp-1 flex-1",
                  isGlass ? "font-semibold tracking-normal" : "font-black uppercase tracking-tight"
                )}>{selected.title}</span>
                <span className={cn(
                  "text-[10px] opacity-50 ml-4 shrink-0",
                  isGlass ? "font-medium tracking-normal" : "font-bold uppercase"
                )}>{Math.round(readProgress * 100)}%</span>
              </div>

              <div
                ref={readerRef}
                className={cn(
                  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-5 md:p-12 custom-scrollbar selection:bg-foreground selection:text-background overscroll-y-contain touch-pan-y",
                  isGlass ? "bg-transparent" : "bg-background"
                )}
              >
                <article className="markdown-body mx-auto max-w-[750px] pb-24">

                  {/* Note header with metadata */}
                  <div className={cn("mb-12 pb-8 relative", isGlass ? "border-b border-[var(--glass-border)]" : "border-b-4 border-foreground")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                    <h1 className={cn(
                      "text-4xl md:text-[3rem] leading-[1.1] mb-6 break-words border-none pb-0 relative z-10 flex items-start gap-4",
                      isGlass ? "font-semibold tracking-tight" : "font-black uppercase tracking-tighter"
                    )}>
                      {selected.title}
                      {/* opt #3: 44x44px touch target */}
                      <button onClick={(e) => toggleFavorite(e, selected.id)} className={cn(
                        "mt-2 text-2xl hover:scale-125 transition-transform active:scale-90 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center",
                        selected.isFavorite ? "opacity-100 text-[#D97A35]" : "opacity-30 hover:opacity-100"
                      )}>
                        ★
                      </button>
                    </h1>

                    <div className={cn(
                      "flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] opacity-80 mb-6 relative z-10",
                      isGlass ? "font-medium tracking-normal" : "font-bold uppercase tracking-widest"
                    )}>
                      <span className={cn(isGlass ? "glass-badge rounded-full" : "bg-foreground text-background px-2 py-1 shadow-[2px_2px_0_var(--primary)]")}>Utworzono: {fmt(selected.createdAt)}</span>
                      <span className={cn(isGlass ? "glass-badge rounded-full" : "bg-foreground text-background px-2 py-1 shadow-[2px_2px_0_var(--primary)]")}>Akt: {fmt(selected.updatedAt)}</span>
                    </div>

                    {selected.tags && selected.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {selected.tags.map((t) => (
                          <Badge key={t} variant="outline" className={cn(
                          "text-[10px] px-2 py-0.5",
                          isGlass
                            ? "rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] font-semibold"
                            : "rounded-none border-2 border-foreground uppercase font-black bg-background shadow-[2px_2px_0_var(--foreground)]"
                        )}>{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* opt #12: inline code styling handled in globals.css */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
                    {selected.content}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* opt #8: Bottom nav with icons, count badge, transition */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-40 px-safe pb-safe md:hidden",
        isGlass
          ? "glass-nav border-t border-[var(--glass-border)] rounded-t-3xl"
          : "border-t-4 border-foreground bg-background shadow-[0_-8px_0_var(--foreground)]"
      )}>
        <div className="grid grid-cols-2 gap-2 p-3">
          <Button
            variant={mobileTab === 'list' ? 'default' : 'outline'}
            className={cn(
              "h-14 text-sm transition-all duration-150 flex flex-col gap-0.5 items-center justify-center",
              isGlass
                ? cn(
                    "rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--foreground)] font-semibold tracking-normal normal-case shadow-none",
                    "hover:bg-[var(--glass-bg-hover)]",
                    mobileTab === 'list' && 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
                  )
                : cn(
                    "rounded-none font-black uppercase tracking-wider border-2 border-foreground shadow-[4px_4px_0_var(--foreground)]",
                    mobileTab === 'list' && 'bg-primary border-primary text-primary-foreground shadow-none translate-y-1 translate-x-1'
                  )
            )}
            onClick={() => handleTabChange('list')}
          >
            <List className="h-5 w-5" strokeWidth={2.5} />
            <span className="text-[10px] flex items-center gap-1">
              Notatki
              {filtered.length > 0 && (
                <span className={cn("px-1 text-[9px]", isGlass ? "font-sans" : "font-mono", isGlass ? "bg-[var(--glass-bg)] rounded-full" : "bg-foreground/20")}>{filtered.length}</span>
              )}
            </span>
          </Button>
          <Button
            variant={mobileTab === 'read' ? 'default' : 'outline'}
            className={cn(
              "h-14 text-sm transition-all duration-150 flex flex-col gap-0.5 items-center justify-center",
              isGlass
                ? cn(
                    "rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--foreground)] font-semibold tracking-normal normal-case shadow-none",
                    "hover:bg-[var(--glass-bg-hover)]",
                    mobileTab === 'read' && 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
                  )
                : cn(
                    "rounded-none font-black uppercase tracking-wider border-2 border-foreground shadow-[4px_4px_0_var(--foreground)]",
                    mobileTab === 'read' && 'bg-primary border-primary text-primary-foreground shadow-none translate-y-1 translate-x-1'
                  )
            )}
            onClick={() => handleTabChange('read')}
          >
            <BookOpen className="h-5 w-5" strokeWidth={2.5} />
            <span className="text-[10px]">Czytnik</span>
          </Button>
        </div>
      </nav>

      {/* Brutalist paper texture overlay (brutalist only) */}
      {!isGlass && <div className="vignette-grain" />}

      {/* Ink spill Easter Egg */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
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
