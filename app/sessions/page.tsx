"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type SessionRow = { id: string; title: string | null; type: string; buy_in: number; status: string; started_at: string | null };

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  async function load() {
    const { data } = await supabase.from("sessions").select("id,title,type,buy_in,status,started_at").order("started_at", { ascending: false });
    setSessions(data ?? []);
  }
  useEffect(() => { load(); }, []);
  async function removeSession(id: string) {
    if (!confirm("Delete this session?")) return;
    await supabase.from("sessions").delete().eq("id", id);
    await load();
  }
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sessions</h1>
      <Link href="/sessions/new" className="inline-block mb-4 underline">+ New session</Link>
      <ul className="space-y-3">
        {sessions.map(s => (
          <li key={s.id} className="border rounded p-3 flex items-center justify-between">
            <Link href={`/sessions/${s.id}`} className="block">
              <div className="font-semibold">{s.title || "(untitled)"} — {s.type}</div>
              <div className="text-sm opacity-80">Buy-in: {s.buy_in} | Status: {s.status} | Started: {s.started_at?.slice(0,16) ?? "—"}</div>
            </Link>
            <button onClick={() => removeSession(s.id)} className="px-2 py-1 rounded bg-neutral-700" title="Delete">🗑️</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
