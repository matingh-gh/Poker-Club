'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Player = { id: string; name: string };
type Form = {
  title: string;
  type: 'tournament' | 'cashgame';
  buy_in: number;
  blind_level_minutes: number;  // فقط تورنومنت
  duration_minutes: number;     // فقط کش‌گیم
  start_at?: string | null;
  selected: string[];           // آرایه‌ی player_id
};

export default function NewSessionPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<Form>({
    title: '',
    type: 'tournament',
    buy_in: 100,
    blind_level_minutes: 10,
    duration_minutes: 180,
    start_at: null,
    selected: [],
  });

  // بازیکن‌ها: یکتا بر اساس name
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('players').select('id,name');
      if (error) return setMsg(error.message);
      if (data) {
        const seen = new Set<string>();
        const uniq = (data as Player[]).filter(p => {
          const k = (p.name || '').trim().toLowerCase();
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setPlayers(uniq);
      }
    })();
  }, []);

  const canSubmit = useMemo(() => {
    if (!form.buy_in || form.buy_in <= 0) return false;
    return form.type === 'tournament'
      ? form.blind_level_minutes > 0
      : form.duration_minutes > 0;
  }, [form]);

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    if (!canSubmit) return;

    const payload: any = {
      title: form.title || null,
      type: form.type,
      buy_in: form.buy_in || null,
      status: 'active',
      started_at: form.start_at || new Date().toISOString(),
    };
    if (form.type === 'tournament') {
      payload.blind_level_minutes = form.blind_level_minutes;
      payload.duration_minutes = null;
    } else {
      payload.duration_minutes = form.duration_minutes;
      payload.blind_level_minutes = null;
    }

    const { data: s, error } = await supabase
      .from('sessions')
      .insert(payload)
      .select()
      .single();

    if (error || !s) {
      setMsg(error?.message || 'Error creating session');
      return;
    }

    if (form.selected.length) {
      const rows = form.selected.map(pid => ({
        session_id: s.id,
        player_id: pid,
        starting_stack: 20000,
      }));
      await supabase.from('session_players').insert(rows);
    }

    window.location.href = `/sessions/${s.id}`;
  }

  const toggle = (id: string) => {
    setForm(prev => ({
      ...prev,
      selected: prev.selected.includes(id)
        ? prev.selected.filter(x => x !== id)
        : [...prev.selected, id],
    }));
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Session</h1>

      <form onSubmit={createSession} className="space-y-4">
        <label className="block">
          <div className="mb-1">Title</div>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Friday Night..."
            className="w-full rounded border px-3 py-2 bg-transparent"
          />
        </label>

        <div className="grid grid-cols-3 gap-4">
          <label className="block">
            <div className="mb-1">Type</div>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as any })}
              className="rounded border px-3 py-2 bg-transparent w-full"
            >
              <option value="tournament">tournament</option>
              <option value="cashgame">cashgame</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1">Buy-in</div>
            <input
              type="number"
              value={form.buy_in}
              onChange={e => setForm({ ...form, buy_in: Number(e.target.value) })}
              className="rounded border px-3 py-2 bg-transparent w-full"
            />
          </label>

          {form.type === 'tournament' ? (
            <label className="block">
              <div className="mb-1">Blind level (minutes)</div>
              <input
                type="number"
                value={form.blind_level_minutes}
                onChange={e => setForm({ ...form, blind_level_minutes: Number(e.target.value) })}
                className="rounded border px-3 py-2 bg-transparent w-full"
              />
            </label>
          ) : (
            <label className="block">
              <div className="mb-1">Duration (minutes)</div>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                className="rounded border px-3 py-2 bg-transparent w-full"
              />
            </label>
          )}
        </div>

        <label className="block">
          <div className="mb-1">Start time (optional)</div>
          <input
            type="datetime-local"
            onChange={e =>
              setForm({
                ...form,
                start_at: e.target.value ? new Date(e.target.value).toISOString() : null,
              })
            }
            className="rounded border px-3 py-2 bg-transparent"
          />
        </label>

        <div>
          <div className="mb-1">Add initial players</div>
          <div className="flex flex-wrap gap-2">
            {players.map(p => {
              const selected = form.selected.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`px-3 py-1 rounded border ${selected ? 'bg-white text-black' : ''}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {msg && <div className="text-red-400 text-sm">{msg}</div>}

        <button
          disabled={!canSubmit}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-40"
        >
          Create
        </button>
      </form>
    </main>
  );
}
