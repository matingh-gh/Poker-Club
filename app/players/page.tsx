"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Player = {
  uid: string | null;
  name: string;
  note: string | null;
  created_at: string | null;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadPlayers() {
    setErr(null);
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setErr("Load error: " + error.message);
    else setPlayers(data ?? []);
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  async function addPlayer() {
    setLoading(true);
    setErr(null);
    const trimmed = name.trim();
    if (!trimmed) { setLoading(false); return; }

    console.log("[ADD] sending insert for", trimmed);
    const { data, error } = await supabase
      .from("players")
      .insert({ name: trimmed }) // uid/created_at فرض بر این است که default دارند
      .select()
      .single();

    if (error) {
      console.error("[ADD] error", error);
      setErr("Insert error: " + error.message);
    } else if (data) {
      console.log("[ADD] ok", data);
      setPlayers((prev) => [data as Player, ...prev]);
      setName("");
    }
    setLoading(false);
  }

  return (
    <main className="max-w-xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Players</h1>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          className="bg-white/10 border border-white/15 rounded px-3 py-2 w-full outline-none"
        />
        <button
          type="button"
          onClick={addPlayer}
          disabled={loading}
          className="px-3 py-2 rounded bg-white text-black disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {err && <p className="text-red-400 text-sm">{err}</p>}

      <ul className="space-y-2">
        {players.map((p, i) => (
          <li key={(p.uid ?? "") + i} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
            <span>{p.name}</span>
            <span className="opacity-60 text-xs">{p.created_at?.slice(0,10) ?? ""}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
