"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = {
  player_id: string;
  name: string;
  net: number;
  position: number | null;
  type: "tournament" | "cashgame";
};

export default function RankingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<"tournament"|"cashgame">("tournament");

  useEffect(() => {
    (async () => {
      // join results + players + sessions
      const { data: r } = await supabase
        .from("results")
        .select("player_id, net, position, sessions(type), players(name)")
        .order("created_at", { ascending: true });
      const mapped: Row[] = (r ?? []).map((x: any) => ({
        player_id: x.player_id,
        name: x.players?.name ?? "—",
        net: Number(x.net) || 0,
        position: x.position ?? null,
        type: x.sessions?.type ?? "tournament"
      }));
      setRows(mapped);
    })();
  }, []);

  const byType = useMemo(() => rows.filter(r => r.type === tab), [rows, tab]);

  const table = useMemo(() => {
    const map = new Map<string, { name: string; net: number; wins: number; seconds: number; thirds: number; positives: number; negatives: number; count: number }>();
    for (const r of byType) {
      const it = map.get(r.player_id) ?? { name: r.name, net: 0, wins: 0, seconds: 0, thirds: 0, positives: 0, negatives: 0, count: 0 };
      it.net = round2(it.net + r.net);
      if (r.type === "tournament" && r.position != null) {
        if (r.position === 1) it.wins++;
        else if (r.position === 2) it.seconds++;
        else if (r.position === 3) it.thirds++;
      }
      if (r.net > 0) it.positives++; else if (r.net < 0) it.negatives++;
      it.count++;
      map.set(r.player_id, it);
    }
    const arr = Array.from(map.values());
    arr.sort((a,b) => b.net - a.net);
    return arr;
  }, [byType]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All-time Ranking</h1>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab("tournament")} className={`px-3 py-1 rounded border ${tab==="tournament"?"bg-neutral-700":""}`}>Tournament</button>
        <button onClick={() => setTab("cashgame")}   className={`px-3 py-1 rounded border ${tab==="cashgame"  ?"bg-neutral-700":""}`}>Cashgame</button>
      </div>

      <table className="w-full text-sm">
        <thead className="opacity-80">
          <tr>
            <th className="text-left py-2">Player</th>
            <th className="text-right">Net</th>
            {tab==="tournament" && <>
              <th className="text-right">1st</th>
              <th className="text-right">2nd</th>
              <th className="text-right">3rd</th>
            </>}
            <th className="text-right">+ sessions</th>
            <th className="text-right">- sessions</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {table.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="py-2">{r.name}</td>
              <td className="text-right font-medium">{r.net >= 0 ? `+${r.net}` : r.net}</td>
              {tab==="tournament" && <>
                <td className="text-right">{r.wins}</td>
                <td className="text-right">{r.seconds}</td>
                <td className="text-right">{r.thirds}</td>
              </>}
              <td className="text-right">{r.positives}</td>
              <td className="text-right">{r.negatives}</td>
              <td className="text-right">{r.count}</td>
            </tr>
          ))}
          {table.length === 0 && (
            <tr><td className="py-6 opacity-60" colSpan={7}>No data yet.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

function round2(n:number){ return Math.round(n*100)/100; }
