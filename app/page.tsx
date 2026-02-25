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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Note, NotesPayload } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortMode = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'title_asc';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? 'local';

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
      setPass(password);
      setPayload(json.data);
      if (json.data?.notes?.length) setSelectedId(json.data.notes[0].id);
    } catch {
      setLoginError('Błąd sieci.');
    } finally {
      setLoading(false);
    }
  }

  const notes = useMemo(() => payload?.notes ?? [], [payload]);
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
      <div className="min-h-dvh flex items-center justify-center p-6 vision-bg">
        <div className="w-full max-w-sm p-8 text-center glass-panel">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Aura Notes</h1>
          <p className="text-sm opacity-60 mb-8">Secure Vault Access</p>
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
              placeholder="Enter password..." 
              className="h-12 text-center rounded-2xl bg-white/50 dark:bg-black/50 border-white/20 dark:border-white/10"
            />
            <Button type="submit" className="w-full h-12 rounded-2xl font-semibold text-md shadow-lg">{loading ? 'Unlocking...' : 'Unlock'}</Button>
            {loginError && <p className="text-sm text-destructive font-medium">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh vision-bg">
      <div className="mx-auto flex h-dvh max-w-[1600px] gap-4 p-3 md:p-6">
        <aside className={cn('glass-panel flex flex-col w-full md:w-[380px] md:shrink-0', mobileTab === 'read' && 'hidden md:flex')}>
          <div className="border-b-glass p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Aura Notes</h2>
                <Badge variant="secondary" className="font-mono text-[10px] bg-black/5 dark:bg-white/10 rounded-full">{APP_VERSION}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                {theme === 'light' ? <Moon className="h-5 w-5" strokeWidth={1.5} /> : <Sun className="h-5 w-5" strokeWidth={1.5} />}
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity" strokeWidth={1.5} />
                <Input 
                  className="pl-10 h-11 rounded-2xl bg-white/40 dark:bg-black/40 border-white/40 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 transition-all" 
                  placeholder="Search notes..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
                <SelectTrigger className="h-11 w-[110px] rounded-2xl bg-white/40 dark:bg-black/40 border-white/40 dark:border-white/10 text-sm focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 transition-all">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-0">
                  {Object.entries(SORT_LABELS).map(([k, v]) => (
                    <SelectItem value={k} key={k} className="rounded-xl">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="mt-3 text-[11px] font-medium opacity-50 px-1">
              {filtered.length} notes • Sync: {fmt(payload.generatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-b-glass p-4">
            <button className={cn('chip', activeTag === 'all' && 'chip-active')} onClick={() => setActiveTag('all')}>All</button>
            {tags.map((t) => (
              <button key={t} className={cn('chip', activeTag === t && 'chip-active')} onClick={() => setActiveTag(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
            <div className="grid gap-1">
              {filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedId(n.id);
                    if (window.innerWidth < 768) setMobileTab('read');
                  }}
                  className={cn('note-btn text-left', selectedId === n.id && 'note-btn-active')}
                >
                  <div className="line-clamp-2 font-semibold text-[0.95rem] leading-snug">{n.title}</div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs opacity-60 font-medium">
                    <span>{fmt(n.updatedAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                    <span>{n.readingMinutes} min read</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className={cn('glass-panel flex flex-col min-w-0 flex-1 relative overflow-hidden', mobileTab === 'list' && 'hidden md:flex')}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <div className="w-16 h-16 rounded-full border-2 border-current border-dashed mb-4 opacity-50 animate-pulse"></div>
              <p className="font-medium">No note selected</p>
            </div>
          ) : (
            <>
              <header className="border-b-glass p-5 md:p-8 shrink-0">
                <div className="mb-4 flex items-center gap-2 md:hidden">
                  <Button variant="ghost" size="icon" onClick={() => setMobileTab('list')} className="rounded-full bg-black/5 dark:bg-white/10">
                    <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                  <span className="text-sm font-medium opacity-60">Back to notes</span>
                </div>
                
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl leading-tight mb-4">{selected.title}</h1>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium opacity-60">
                  <span>Created {fmt(selected.createdAt)}</span>
                  <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                  <span>Updated {fmt(selected.updatedAt)}</span>
                  <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                  <span className="break-all font-mono opacity-80">{selected.path}</span>
                </div>
                
                <div className="mt-5 flex flex-wrap gap-2">
                  {(selected.tags || []).map((t) => (
                    <Badge key={t} variant="outline" className="rounded-full bg-black/5 dark:bg-white/5 border-transparent font-medium">{t}</Badge>
                  ))}
                </div>
              </header>
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto p-5 md:p-10 custom-scrollbar">
                <article className="markdown-body mx-auto max-w-[700px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
                    {selected.content}
                  </ReactMarkdown>
                </article>
              </div>
            </>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/70 p-3 backdrop-blur-xl md:hidden pb-safe">
        <Button variant={mobileTab === 'list' ? 'secondary' : 'ghost'} className="rounded-xl h-12 font-medium" onClick={() => setMobileTab('list')}>Notes</Button>
        <Button variant={mobileTab === 'read' ? 'secondary' : 'ghost'} className="rounded-xl h-12 font-medium" onClick={() => setMobileTab('read')}>Reader</Button>
      </nav>
    </div>
  );
}
