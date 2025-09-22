"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Sett = { id: string; session_id: string; from_player_id: string; to_player_id: string; amount: number; created_at: string };
type Player = { id: string; name: string };

export default function SettlementsPage({ params }: { params: { id: string } }) {
  const sessionId = params.id;
  const [rows, setRows] = useState<Sett[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("settlements").select("*").eq("session_id", sessionId).order("created_at");
      setRows(s ?? []);
      const { data: ps } = await supabase.from("players").select("id,name");
      setPlayers(ps ?? []);
    })();
  }, [sessionId]);

  const name = (pid: string) => players.find(p => p.id === pid)?.name ?? pid.slice(0,8);

  const totalOut = useMemo(() => rows.reduce((a,r)=>a+r.amount,0), [rows]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Settlements</h1>
      {rows.length === 0 ? (
        <div className="opacity-70">No settlements recorded yet (finish the session first).</div>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {rows.map(r => (
              <li key={r.id} className="border rounded p-3">
                <b>{name(r.from_player_id)}</b> → <b>{name(r.to_player_id)}</b>
                <span className="float-right font-semibold">{r.amount}</span>
              </li>
            ))}
          </ul>
          <div className="text-sm opacity-80">Total exchanged: <b>{totalOut}</b></div>
        </>
      )}
    </main>
  );
}
