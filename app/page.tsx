'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, Moon, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Note, NotesPayload } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortMode = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'title_asc';

const SORT_LABELS: Record<SortMode, string> = {
  updated_desc: 'Akt. ↓',
  updated_asc: 'Akt. ↑',
  created_desc: 'Utw. ↓',
  created_asc: 'Utw. ↑',
  title_asc: 'A-Z',
};

function fmt(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Page() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
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

  useEffect(() => {
    const savedTheme = (localStorage.getItem('aura-theme') as 'light' | 'dark' | null) ?? 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  async function loadNotes(password: string) {
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/.netlify/functions/notes', { headers: { 'x-aura-pass': password } });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setLoginError('Błędne hasło.');
        return;
      }
      if (!res.ok || !json.ok) {
        setLoginError(json.error || 'Błąd API notatek');
        return;
      }
      setPass(password);
      setPayload(json.data);
      if (json.data?.notes?.length) setSelectedId(json.data.notes[0].id);
    } catch {
      setLoginError('Błąd sieci.');
    } finally {
      setLoading(false);
    }
  }

  const notes = payload?.notes ?? [];
  const tags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = notes.filter((n) => {
      if (activeTag !== 'all' && !(n.tags || []).includes(activeTag)) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.path.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
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
  }, [notes, activeTag, query, sort]);

  const selected = filtered.find((n) => n.id === selectedId) || notes.find((n) => n.id === selectedId) || null;

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('aura-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  if (!payload) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 grid place-items-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">Aura Notes</h1>
          <p className="mt-1 text-sm text-zinc-500">Vault Access</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              loadNotes(loginInput);
            }}
          >
            <Input type="password" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} placeholder="Hasło" />
            <Button type="submit" className="w-full">{loading ? 'Ładowanie…' : 'Odblokuj'}</Button>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex h-dvh max-w-[1600px] gap-4 p-3 md:p-6">
        <aside className={cn('glass-panel w-full md:w-[390px] md:shrink-0', mobileTab === 'read' && 'hidden md:flex')}>
          <div className="border-b border-zinc-200/70 p-4 dark:border-zinc-800/70">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Aura Notes</h2>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input className="pl-9" placeholder="Szukaj…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {Object.entries(SORT_LABELS).map(([k, v]) => (
                  <option value={k} key={k}>{v}</option>
                ))}
              </select>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Notatki: {filtered.length} • Sync: {fmt(payload.generatedAt)} • Treść: {fmt(payload.latestUpdatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-zinc-200/70 p-3 dark:border-zinc-800/70">
            <button className={cn('chip', activeTag === 'all' && 'chip-active')} onClick={() => setActiveTag('all')}>Wszystkie</button>
            {tags.map((t) => (
              <button key={t} className={cn('chip', activeTag === t && 'chip-active')} onClick={() => setActiveTag(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
            <div className="grid gap-2">
              {filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedId(n.id);
                    if (window.innerWidth < 768) setMobileTab('read');
                  }}
                  className={cn('note-btn text-left', selectedId === n.id && 'note-btn-active')}
                >
                  <div className="line-clamp-2 font-semibold">{n.title}</div>
                  <div className="mt-1 text-xs text-zinc-500">{fmt(n.updatedAt)} • {n.readingMinutes} min</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className={cn('glass-panel min-w-0 flex-1', mobileTab === 'list' && 'hidden md:flex')}>
          {!selected ? (
            <div className="grid h-full place-items-center text-zinc-500">Wybierz notatkę</div>
          ) : (
            <>
              <header className="border-b border-zinc-200/70 p-4 dark:border-zinc-800/70">
                <div className="mb-3 flex items-center gap-2 md:hidden">
                  <Button variant="outline" size="icon" onClick={() => setMobileTab('list')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-zinc-500">Powrót do listy</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight md:text-5xl">{selected.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>utw: {fmt(selected.createdAt)}</span>
                  <span>•</span>
                  <span>akt: {fmt(selected.updatedAt)}</span>
                  <span>•</span>
                  <span>{selected.path}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selected.tags || []).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </header>
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto p-4 md:p-8">
                <article className="markdown-body mx-auto max-w-4xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
                    {selected.content}
                  </ReactMarkdown>
                </article>
              </div>
            </>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-zinc-200 bg-white/95 p-2 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
        <Button variant={mobileTab === 'list' ? 'default' : 'ghost'} onClick={() => setMobileTab('list')}>Notatki</Button>
        <Button variant={mobileTab === 'read' ? 'default' : 'ghost'} onClick={() => setMobileTab('read')}>Czytnik</Button>
      </nav>
    </div>
  );
}
