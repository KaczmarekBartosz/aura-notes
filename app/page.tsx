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
      <div className="min-h-dvh flex items-center justify-center p-6 bg-background relative overflow-hidden">
        {/* Dekoracyjna tekstura techniczna/szkicowa */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="w-full max-w-sm p-8 text-center bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)] relative z-10 transition-transform duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0_var(--foreground)]">
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Aura Notes</h1>
          <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-widest">Bezpieczny sejf</p>
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
              className="h-12 text-center rounded-none bg-background border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[4px_4px_0_var(--primary)] transition-all font-mono"
            />
            <Button type="submit" className="w-full h-12 rounded-none border-2 border-transparent hover:border-foreground hover:shadow-[4px_4px_0_var(--foreground)] hover:-translate-y-1 hover:bg-primary transition-all font-black uppercase text-lg">{loading ? 'Odblokowywanie...' : 'Odblokuj'}</Button>
            {loginError && <p className="text-sm text-destructive font-black uppercase mt-2">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground font-sans relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <div className="mx-auto flex h-dvh max-w-[1600px] gap-6 p-4 md:p-8 relative z-10">
        <aside className={cn('bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)] flex flex-col w-full md:w-[400px] md:shrink-0 transition-transform duration-300 hover:shadow-[12px_12px_0_var(--foreground)]', mobileTab === 'read' && 'hidden md:flex')}>
          <div className="border-b-4 border-foreground p-4 md:p-5 bg-muted/30">
            <div className="mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">Aura Notes</h2>
                <Badge variant="secondary" className="font-mono text-[10px] rounded-none border-2 border-foreground px-1.5">{APP_VERSION}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-none border-2 border-foreground hover:bg-foreground hover:text-background transition-colors hover:shadow-[4px_4px_0_var(--foreground)] hover:-translate-y-1">
                {theme === 'light' ? <Moon className="h-5 w-5" strokeWidth={2.5} /> : <Sun className="h-5 w-5" strokeWidth={2.5} />}
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity" strokeWidth={3} />
                <Input 
                  className="pl-9 h-11 rounded-none bg-background border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[4px_4px_0_var(--primary)] transition-all font-bold" 
                  placeholder="Szukaj notatek..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
                <SelectTrigger className="h-11 w-[110px] rounded-none bg-background border-2 border-foreground text-sm font-bold focus:ring-0 focus:border-primary focus:shadow-[4px_4px_0_var(--primary)] transition-all">
                  <SelectValue placeholder="Sortuj" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-2 border-foreground shadow-[4px_4px_0_var(--foreground)] bg-background">
                  {Object.entries(SORT_LABELS).map(([k, v]) => (
                    <SelectItem value={k} key={k} className="font-bold cursor-pointer hover:bg-foreground hover:text-background uppercase transition-colors">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="mt-4 text-[12px] font-bold opacity-60 px-1 uppercase tracking-wider">
              {filtered.length} notatek • Synchr.: {fmt(payload.generatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-b-4 border-foreground p-3 bg-muted/10">
            <button className={cn('chip', activeTag === 'all' && 'chip-active')} onClick={() => setActiveTag('all')}>Wszystkie</button>
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
                  className={cn('note-btn text-left group hover:px-5 transition-all duration-200 border-b-2 border-foreground/10', selectedId === n.id && 'note-btn-active bg-primary text-primary-foreground border-transparent border-l-8 border-l-foreground')}
                >
                  <div className="line-clamp-2 font-black text-lg leading-snug uppercase tracking-tight group-hover:tracking-normal transition-all">{n.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-[0.75rem] opacity-70 font-bold uppercase tracking-widest group-hover:opacity-100">
                    <span>{fmt(n.updatedAt)}</span>
                    <span className="w-1.5 h-1.5 bg-current opacity-40"></span>
                    <span>{n.readingMinutes} min czytania</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className={cn('bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)] flex flex-col min-w-0 flex-1 relative overflow-hidden transition-all duration-300', mobileTab === 'list' && 'hidden md:flex')}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full opacity-80 bg-muted/10">
              <img src="/sketchbook.png" alt="Empty Sketchbook" className="w-[300px] h-[300px] object-cover mb-8 filter grayscale contrast-125 border-4 border-foreground shadow-[8px_8px_0_var(--primary)] -rotate-2" />
              <p className="font-black text-3xl uppercase tracking-[0.2em] bg-foreground text-background px-6 py-3 shadow-[8px_8px_0_var(--primary)] rotate-1">Nie wybrano notatki</p>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-8 fade-in duration-500 fill-mode-both flex flex-col h-full" key={selected.id}>
              {/* Cienki nagłówek mobilny przypięty na stałe tylko w mobile */}
              <div className="md:hidden border-b-4 border-foreground p-3 bg-muted/10 flex items-center justify-between shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setMobileTab('list')} className="rounded-none border-2 border-foreground hover:bg-foreground hover:text-background shadow-[4px_4px_0_var(--foreground)]">
                  <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                </Button>
                <span className="text-sm font-black uppercase tracking-wider bg-foreground text-background px-3 py-1.5 shadow-[4px_4px_0_var(--primary)] text-center">Notatki</span>
              </div>
              
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-5 md:p-12 custom-scrollbar bg-background selection:bg-foreground selection:text-background">
                <article className="markdown-body mx-auto max-w-[750px] pb-24">
                  
                  {/* Nagłówek i tagi wklejone jako treść, by się przewijały! */}
                  <div className="mb-12 border-b-4 border-foreground pb-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
                    <h1 className="text-4xl font-black tracking-tighter md:text-[3rem] leading-[1.1] mb-6 uppercase break-words border-none pb-0 relative z-10">{selected.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] font-bold uppercase tracking-widest opacity-80 mb-6 relative z-10">
                      <span className="bg-foreground text-background px-2 py-1 shadow-[2px_2px_0_var(--primary)]">Utworzono: {fmt(selected.createdAt)}</span>
                      <span className="bg-foreground text-background px-2 py-1 shadow-[2px_2px_0_var(--primary)]">Akt: {fmt(selected.updatedAt)}</span>
                    </div>
                    
                    {selected.tags && selected.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {selected.tags.map((t) => (
                          <Badge key={t} variant="outline" className="rounded-none border-2 border-foreground uppercase font-black text-[10px] px-2 py-0.5 bg-background shadow-[2px_2px_0_var(--foreground)]">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
                    {selected.content}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t-4 border-foreground bg-background p-4 md:hidden pb-safe gap-2 shadow-[0_-8px_0_var(--foreground)]">
        <Button variant={mobileTab === 'list' ? 'default' : 'outline'} className={cn("rounded-none h-14 font-black uppercase tracking-wider text-sm border-2 border-foreground shadow-[4px_4px_0_var(--foreground)]", mobileTab === 'list' && 'bg-primary border-primary text-primary-foreground shadow-none translate-y-1 translate-x-1')} onClick={() => setMobileTab('list')}>Notatki</Button>
        <Button variant={mobileTab === 'read' ? 'default' : 'outline'} className={cn("rounded-none h-14 font-black uppercase tracking-wider text-sm border-2 border-foreground shadow-[4px_4px_0_var(--foreground)]", mobileTab === 'read' && 'bg-primary border-primary text-primary-foreground shadow-none translate-y-1 translate-x-1')} onClick={() => setMobileTab('read')}>Czytnik</Button>
      </nav>
    </div>
  );
}
