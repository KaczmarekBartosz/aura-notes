# Navigation Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign Aura Notes navigation to hierarchical category-based browsing with 4-tab bottom nav, collapsing header, slide transitions, and contextual empty states — achieving premium native-grade mobile UX.

**Architecture:** Single-file SPA stays in `app/page.tsx`. New hooks extracted to `lib/hooks.ts`. CSS animations in `globals.css`. ThemeSwitcher gets full-screen "Motyw" tab variant. All changes respect dual-rendering pattern (`isGlass ? ... : ...`).

**Tech Stack:** React 19, Next.js 15, Tailwind CSS v4, Lucide React icons, existing theme system (5 themes).

---

## Task 1: Add new hooks to `lib/hooks.ts`

**Files:**
- Modify: `lib/hooks.ts`

**Step 1: Add `useRelativeTime` hook**

```typescript
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
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}
```

**Step 2: Add `useCollapsibleHeader` hook**

```typescript
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
```

**Step 3: Add `useEdgeSwipe` hook**

```typescript
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
```

**Step 4: Verify file compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to hooks.ts

**Step 5: Commit**

```bash
git add lib/hooks.ts
git commit -m "feat(hooks): add useRelativeTime, useCollapsibleHeader, useEdgeSwipe"
```

---

## Task 2: Add CSS animations and new utility classes to `globals.css`

**Files:**
- Modify: `app/globals.css`

**Step 1: Add slide transition animations**

Append after the existing `/* Login screen */` section at the end of the file:

```css
/* ==========================================================================
   NAVIGATION REDESIGN — SLIDE TRANSITIONS
   ========================================================================== */

/* Reader slide-in from right */
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes slide-out-right {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

.reader-enter {
  animation: slide-in-right 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
}
.reader-exit {
  animation: slide-out-right 250ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

/* Bottom nav hide/show in reader mode */
@keyframes nav-slide-down {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(100%); opacity: 0; }
}
@keyframes nav-slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.bottom-nav-hide {
  animation: nav-slide-down 250ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
}
.bottom-nav-show {
  animation: nav-slide-up 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

/* Collapsing header */
.header-collapsible {
  transition: transform 200ms ease, opacity 200ms ease;
}
.header-hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

/* ==========================================================================
   NAVIGATION REDESIGN — HORIZONTAL CHIP SCROLL
   ========================================================================== */

.chip-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  padding: 0.75rem 1rem;
}
.chip-scroll::-webkit-scrollbar {
  display: none;
}
.chip-scroll .chip {
  flex-shrink: 0;
  scroll-snap-align: start;
}

/* ==========================================================================
   NAVIGATION REDESIGN — SEARCH OVERLAY
   ========================================================================== */

.search-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.search-overlay-backdrop {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* ==========================================================================
   NAVIGATION REDESIGN — BOTTOM NAV v2
   ========================================================================== */

.bottom-nav-v2 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 0.5rem 0.75rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
}

.bottom-nav-v2-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  padding: 0.5rem 0;
  min-height: 48px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  transition: color 150ms ease, transform 150ms ease;
}

.bottom-nav-v2-item:active {
  transform: scale(0.92);
}

.bottom-nav-v2-item[data-active="true"] {
  color: var(--primary);
}

.bottom-nav-v2-label {
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1;
}

/* Active indicator dot */
.bottom-nav-v2-item[data-active="true"]::before {
  content: '';
  position: absolute;
  top: 0.25rem;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
}

/* Compact note row */
.note-row {
  display: flex;
  flex-direction: column;
  padding: 0.875rem 1rem;
  border: none;
  border-bottom: 1px solid var(--border);
  background: transparent;
  text-align: left;
  cursor: pointer;
  width: 100%;
  min-height: 64px;
  transition: background-color 150ms ease;
}

.note-row:active {
  transform: scale(0.985);
}

.note-row:hover {
  background: var(--muted);
}

.note-row-active {
  border-left: 3px solid var(--primary);
  background: color-mix(in oklch, var(--primary) 8%, transparent);
}
```

**Step 2: Verify CSS parses correctly**

Run: `npm run dev` (briefly check console for CSS errors)

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(css): add slide transitions, chip scroll, bottom nav v2, and note row styles"
```

---

## Task 3: Rewrite `app/page.tsx` — Navigation state and bottom nav

This is the largest task. We rewrite page.tsx with the new navigation architecture.

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace state declarations and imports**

Replace the entire import block and state declarations (lines 1-86) with:

```typescript
'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import {
  ArrowLeft, BookOpen, Search, Star, Palette, LayoutGrid,
  SlidersHorizontal, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { NotesPayload } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  useDebounce,
  useScrollProgress,
  useCollapsibleHeader,
  useEdgeSwipe,
  useRelativeTime,
} from '@/lib/hooks';
import { useTheme } from '@/lib/theme';
import { ThemeSwitcher } from '@/components/glass';

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
  'fitness-health': 'Fitness & Health',
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

const CATEGORY_ICONS: Record<string, string> = {
  'fitness-health': '💪',
  'golden-protocols': '⚗️',
  'ai-agents': '🤖',
  'bookmarks': '🔖',
  'design': '🎨',
  'daily-log': '📅',
  'growth-marketing': '📈',
  'outputs': '📤',
  'recipes': '🍳',
  'taste': '👅',
};
```

**Step 2: Replace the Page component state block**

Replace state declarations inside `export default function Page()` with the new navigation state model:

```typescript
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

  /* ── Navigation state (NEW) ── */
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

  /* ── Easter eggs (preserved) ── */
  const [dogAnim, setDogAnim] = useState(false);
  const [inkSpills, setInkSpills] = useState<{ id: number; x: number; y: number }[]>([]);

  /* ── Pull-to-refresh (preserved) ── */
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ── Refs ── */
  const readerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const touchStartY = useRef(0);
  const pullActive = useRef(false);

  /* ── Derived hooks ── */
  const debouncedQuery = useDebounce(query, 150);
  const { progress: readProgress, scrollY: readerScrollY } = useScrollProgress(readerRef);
  const isHeaderHidden = useCollapsibleHeader(listRef);
```

**Step 3: Replace `handleSelectNote` and add new navigation handlers**

```typescript
  /* ── Navigation handlers ── */

  const openReader = useCallback((id: string) => {
    setSelectedId(id);
    setIsReaderOpen(true);
    setIsReaderExiting(false);
    readerRef.current?.scrollTo(0, 0);
  }, []);

  const closeReader = useCallback(() => {
    setIsReaderExiting(true);
    setTimeout(() => {
      setIsReaderOpen(false);
      setIsReaderExiting(false);
    }, 250); // match slide-out-right duration
  }, []);

  const selectCategory = useCallback((cat: string | null) => {
    setActiveCategory(cat);
    setActiveTag(null); // reset tag when category changes
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
```

**Step 4: Keep existing effects (ink spill, data loading, pull-to-refresh) — no changes**

The existing `useEffect` blocks for ink spill Easter egg (lines 108-139), `loadNotes` function (lines 144-171), `toggleFavorite` (lines 177-185), and pull-to-refresh handlers (lines 308-332) should be kept as-is.

**Step 5: Replace derived data computations (filtered, tags, categories)**

```typescript
  /* ── Derived data ── */
  const notes = useMemo(() => payload?.notes ?? [], [payload]);

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
      // Tab-level filtering
      if (activeTab === 'desk') return n.isFavorite;
      if (activeTab === 'search') {
        // Global search — search all non-system notes
        if (!q) return false; // don't show anything until user types
        const isSystem = n.category === 'system';
        if (isSystem) return false;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          n.category.toLowerCase().includes(q)
        );
      }

      // Browse tab
      const isSystem = n.category === 'system';
      if (isSystem) return false;
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
        case 'updated_asc':
          return +new Date(a.updatedAt) - +new Date(b.updatedAt);
        case 'created_desc':
          return +new Date(b.createdAt || b.updatedAt) - +new Date(a.createdAt || a.updatedAt);
        case 'created_asc':
          return +new Date(a.createdAt || a.updatedAt) - +new Date(b.createdAt || b.updatedAt);
        case 'title_asc':
          return a.title.localeCompare(b.title, 'pl');
        default:
          return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      }
    });
  }, [notes, activeTab, activeCategory, activeTag, debouncedQuery, sort]);

  const selected = filtered.find((n) => n.id === selectedId)
    || notes.find((n) => n.id === selectedId)
    || null;
```

**Step 6: Replace keyboard shortcuts**

```typescript
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
          readerRef.current?.scrollTo(0, 0);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedId, isReaderOpen, isSearchOpen, activeTab, closeReader, closeSearch, openSearch]);
```

**Step 7: Keep helper functions** — `highlightText`, `getSnippet`, pull-to-refresh handlers from existing code. No changes needed.

**Step 8: Add relative time formatting helper**

```typescript
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
```

**Step 9: Commit state/logic refactor**

```bash
git add app/page.tsx
git commit -m "refactor(page): new navigation state model with hierarchical browsing"
```

---

## Task 4: Rewrite `app/page.tsx` — Login screen (keep mostly as-is)

**Files:**
- Modify: `app/page.tsx`

**Step 1: Keep the login screen JSX unchanged**

The login screen (`if (!token)` block, lines 338-468) stays identical — it's already well-designed with dual theme support.

No code changes needed.

---

## Task 5: Rewrite `app/page.tsx` — Main app layout with 4-tab architecture

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace the main app return block**

Replace everything from `/* MAIN APP */` to end of component with the new layout. The structure:

```
<div> (root container, h-[100dvh])
  ├── {isGlass && aurora-bg}
  ├── {!isGlass && dot pattern}
  ├── <div> (content area, flex, full height)
  │   ├── Desktop: sidebar + main side-by-side
  │   └── Mobile: single panel switching by activeTab
  │       ├── browse: categories → tags → note list
  │       ├── desk: flat favorites list
  │       ├── search: search overlay
  │       └── theme: ThemeSwitcher preview variant
  ├── Reader (absolute overlay, slide-in when isReaderOpen)
  ├── Bottom Nav (4 tabs, hidden in reader)
  └── Overlays (vignette, ink spills)
</div>
```

The full JSX follows. This is the largest piece of code:

```tsx
  /* ═══════════════════════════════════════════════
     MAIN APP
     ═══════════════════════════════════════════════ */

  return (
    <div
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

      {/* ── Content area ── */}
      <div className="mx-auto flex h-full w-full max-w-[1600px] gap-0 md:gap-6 md:p-8 relative z-10 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)] md:pb-0">

        {/* ═══ SIDEBAR (desktop: always visible, mobile: activeTab controls content) ═══ */}
        <aside
          className={cn(
            'flex flex-col w-full md:w-[400px] md:shrink-0 h-full',
            isGlass ? 'md:glass-card' : 'md:bg-card md:border-4 md:border-foreground md:shadow-[8px_8px_0_var(--foreground)]',
            // On mobile, hide sidebar when reader is open
            isReaderOpen && 'hidden md:flex'
          )}
        >
          {/* ── Collapsible Header ── */}
          <div
            className={cn(
              'header-collapsible shrink-0',
              isGlass
                ? 'border-b border-[var(--glass-border)] bg-[var(--glass-bg)]'
                : 'border-b md:border-b-4 border-foreground/10 md:border-foreground bg-muted/30',
              isHeaderHidden && 'md:header-hidden' // Only collapse on desktop; mobile header stays
            )}
          >
            {/* Header row */}
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
                      {CATEGORY_ICONS[activeCategory] || '📁'}{' '}
                      {CATEGORY_LABELS[activeCategory] || activeCategory}
                    </span>
                  </>
                ) : activeTab === 'desk' ? (
                  <span className={cn(
                    'text-lg',
                    isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight'
                  )}>
                    ★ Biurko
                  </span>
                ) : activeTab === 'search' ? (
                  <span className={cn(
                    'text-lg',
                    isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight'
                  )}>
                    Szukaj
                  </span>
                ) : activeTab === 'theme' ? (
                  <span className={cn(
                    'text-lg',
                    isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight'
                  )}>
                    Motyw
                  </span>
                ) : (
                  <span className={cn(
                    'text-lg',
                    isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tight'
                  )}>
                    Aura Notes
                  </span>
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
                    onClick={() => setShowSortMenu(!showSortMenu)}
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

            {/* Sort dropdown (if open) */}
            {showSortMenu && (
              <div className={cn(
                'absolute right-4 top-14 z-50 min-w-[160px]',
                isGlass
                  ? 'glass-card rounded-2xl border border-[var(--glass-border)] p-2'
                  : 'bg-card border-2 border-foreground shadow-[4px_4px_0_var(--foreground)] p-2'
              )}>
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
                {filtered.length} notatek
              </div>
            )}
          </div>

          {/* ── Search overlay ── */}
          {isSearchOpen && (
            <div className="search-overlay">
              <div className={cn(
                'search-overlay-backdrop',
                isGlass ? 'bg-[var(--background)]/90' : 'bg-background/95'
              )} />
              <div className="relative z-10 p-4">
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
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={closeSearch}
                    className={cn(
                      'min-w-[44px] min-h-[44px] flex items-center justify-center',
                      isGlass ? 'hover:bg-[var(--glass-bg-hover)] rounded-full' : 'hover:bg-muted'
                    )}
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Category chips (browse tab, no active category) ── */}
          {activeTab === 'browse' && !activeCategory && !isSearchOpen && (
            <div className={cn(
              'chip-scroll shrink-0',
              isGlass ? 'border-b border-[var(--glass-border)]' : 'border-b md:border-b-4 border-foreground/10 md:border-foreground'
            )}>
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

          {/* ── Tag chips (browse tab, category selected) ── */}
          {activeTab === 'browse' && activeCategory && !isSearchOpen && tagsForCategory.length > 0 && (
            <div className={cn(
              'chip-scroll shrink-0',
              isGlass ? 'border-b border-[var(--glass-border)]' : 'border-b md:border-b-4 border-foreground/10 md:border-foreground'
            )}>
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

          {/* ── Search tab: always-visible search input ── */}
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

          {/* ── Theme tab: full-screen theme picker ── */}
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
                if (dy > 0) setPullDistance(Math.min(dy * 0.5, 80));
              }}
              onTouchEnd={() => {
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
                      <p className={cn('text-lg', isGlass ? 'font-semibold' : 'font-black uppercase')}>Nie znaleziono „{debouncedQuery}"</p>
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
                {filtered.map((n) => {
                  const snippet = debouncedQuery ? getSnippet(n.content, debouncedQuery.trim()) : null;
                  const excerpt = n.excerpt || (n.plainText ? n.plainText.slice(0, 80) : n.content.replace(/[#*_\[\]]/g, '').slice(0, 80));
                  return (
                    <button
                      key={n.id}
                      onClick={() => openReader(n.id)}
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

                      {/* Excerpt or search snippet */}
                      <p className={cn(
                        'mt-0.5 text-[0.8rem] opacity-50 line-clamp-1',
                        isGlass ? 'font-normal' : 'font-medium'
                      )}>
                        {snippet ? highlightText(snippet, debouncedQuery.trim()) : excerpt}
                      </p>

                      {/* Meta row */}
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

        {/* ═══ READER / MAIN CONTENT (desktop: side panel, mobile: slide overlay) ═══ */}
        <main
          className={cn(
            'flex flex-col min-w-0 flex-1 relative overflow-hidden',
            // Desktop: always visible
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
                  isGlass
                    ? 'font-semibold tracking-tight'
                    : 'font-black uppercase tracking-wider'
                )}>Wybierz notatkę</p>
                <p className={cn('mt-3 text-sm opacity-40', isGlass ? 'font-medium' : 'font-bold uppercase')}>
                  {filtered.length} notatek dostępnych
                </p>
              </div>
            </div>
          ) : (
            <ReaderContent
              note={selected}
              readProgress={readProgress}
              readerScrollY={readerScrollY}
              readerRef={readerRef}
              isGlass={isGlass}
              onBack={undefined}
              toggleFavorite={toggleFavorite}
              fmtRelative={fmtRelative}
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
            readProgress={readProgress}
            readerScrollY={readerScrollY}
            readerRef={readerRef}
            isGlass={isGlass}
            onBack={closeReader}
            toggleFavorite={toggleFavorite}
            fmtRelative={fmtRelative}
          />
        </div>
      )}

      {/* ═══ BOTTOM NAV (mobile only, hidden in reader) ═══ */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 md:hidden',
          isGlass
            ? 'bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--glass-border)]'
            : 'bg-card border-t-2 border-foreground',
          isReaderOpen ? 'bottom-nav-hide' : 'bottom-nav-show'
        )}
      >
        <div className="bottom-nav-v2">
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
                if (id === 'search') {
                  setQuery('');
                }
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

      {/* Brutalist paper texture overlay */}
      {!isGlass && <div className="vignette-grain" />}

      {/* Ink spill Easter Egg (preserved) */}
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
```

**Step 2: Add the extracted `ReaderContent` component at the bottom of the file**

```tsx
/* ═══════════════════════════════════════════════
   READER CONTENT (shared between desktop panel and mobile overlay)
   ═══════════════════════════════════════════════ */

function ReaderContent({
  note,
  readProgress,
  readerScrollY,
  readerRef,
  isGlass,
  onBack,
  toggleFavorite,
  fmtRelative,
}: {
  note: NonNullable<ReturnType<typeof Array.prototype.find>>;
  readProgress: number;
  readerScrollY: number;
  readerRef: React.RefObject<HTMLDivElement | null>;
  isGlass: boolean;
  onBack: (() => void) | undefined;
  toggleFavorite: (e: React.MouseEvent, id: string) => void;
  fmtRelative: (iso?: string | null) => string;
}) {
  return (
    <div className="flex flex-col h-full" key={note.id}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 bg-foreground/5">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 shrink-0 header-collapsible',
        isGlass
          ? 'border-b border-[var(--glass-border)] bg-[var(--glass-bg)]'
          : 'border-b-2 border-foreground/10 bg-muted/20',
        readerScrollY > 100 && !onBack && 'header-hidden' // desktop only auto-hide
      )}>
        {onBack && (
          <button
            onClick={onBack}
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
          'min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-5 md:p-12 custom-scrollbar selection:bg-foreground selection:text-background overscroll-y-contain touch-pan-y',
          isGlass ? 'bg-transparent' : 'bg-background'
        )}
      >
        <article className="markdown-body mx-auto max-w-[750px] pb-24">
          {/* Note header */}
          <div className={cn('mb-10 pb-6', isGlass ? 'border-b border-[var(--glass-border)]' : 'border-b-2 border-foreground/10')}>
            <h1 className={cn(
              'text-3xl md:text-[2.5rem] leading-[1.1] mb-4 break-words border-none pb-0 flex items-start gap-3',
              isGlass ? 'font-semibold tracking-tight' : 'font-black uppercase tracking-tighter'
            )}>
              {note.title}
              <button
                onClick={(e) => toggleFavorite(e, note.id)}
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
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((t: string) => (
                  <Badge key={t} variant="outline" className={cn(
                    'text-[10px] px-2 py-0.5',
                    isGlass
                      ? 'rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] font-medium'
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
```

**Step 3: Verify the build**

Run: `npx tsc --noEmit`
Run: `npm run dev` (visual check)

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(ui): implement hierarchical navigation, 4-tab bottom nav, slide reader, contextual empty states"
```

---

## Task 6: Final CSS polish and visual QA

**Files:**
- Modify: `app/globals.css` (minor tweaks if needed)

**Step 1: Verify visual rendering**

Run: `npm run dev`

Check:
- [ ] Bottom nav shows 4 tabs, correct icons, active state
- [ ] Categories scroll horizontally on mobile
- [ ] Tags appear after selecting a category
- [ ] Note rows show title + excerpt + meta
- [ ] Reader slides in from right on mobile
- [ ] Back button and edge-swipe close reader
- [ ] Bottom nav hides during reader
- [ ] Empty states show correct messages for each context
- [ ] Theme tab shows full preview cards
- [ ] Search overlay opens/closes correctly
- [ ] All 5 themes render correctly (brutalist + 4 glass)
- [ ] Desktop sidebar + reader panel layout works
- [ ] Pull-to-refresh still works

**Step 2: Fix any visual issues found**

**Step 3: Build verification**

Run: `npm run build`
Expected: Success, no TypeScript errors

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(ui): navigation redesign — complete premium mobile-first UX overhaul"
```
