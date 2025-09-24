"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Tx = {
  player_id: string;
  type: "buyin" | "rebuy" | "cashout";
  amount: number;
};
type Player = { id: string; name: string };

function computeNets(txs: Tx[]): Record<string, number> {
  const nets: Record<string, number> = {};
  for (const t of txs) {
    if (!nets[t.player_id]) nets[t.player_id] = 0;
    if (t.type === "cashout") nets[t.player_id] += t.amount;
    else nets[t.player_id] -= t.amount; // buyin/rebuy => پول خارج شده
  }
  return nets;
}

/** انتقال‌ها با کمترین تعداد تراکنش (حریصانه) */
function computeSettlements(netsByPlayer: { id: string; name: string; net: number }[]) {
  const creditors = [...netsByPlayer.filter(p => p.net > 0)].map(p => ({ ...p, left: p.net }));
  const debtors   = [...netsByPlayer.filter(p => p.net < 0)].map(p => ({ ...p, left: -p.net }));
  const transfers: { from: string; to: string; amount: number }[] = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i], c = creditors[j];
    const amt = Math.min(d.left, c.left);
    if (amt > 0.0001) {
      transfers.push({ from: d.name, to: c.name, amount: Math.round(amt) });
      d.left -= amt; c.left -= amt;
    }
    if (d.left <= 0.0001) i++;
    if (c.left <= 0.0001) j++;
  }
  return transfers;
}

export default function SettlementsClient({ sessionId }: { sessionId: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseKey), [supabaseUrl, supabaseKey]);

  const [players, setPlayers] = useState<Player[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // بازیکن‌ها
        const { data: pls, error: perr } = await supabase
          .from("players")
          .select("id,name");
        if (perr) throw perr;
        // تراکنش‌های سشن
        const { data: tx, error: terr } = await supabase
          .from("transactions")
          .select("player_id,type,amount")
          .eq("session_id", sessionId);
        if (terr) throw terr;

        if (!mounted) return;
        setPlayers((pls || []) as Player[]);
        setTxs((tx || []) as Tx[]);
      } catch (e: any) {
        console.error(e);
        if (mounted) setErr(e?.message || "Failed to load settlements");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sessionId, supabase]);

  const netsMap = useMemo(() => computeNets(txs), [txs]);

  const netsList = useMemo(() => {
    const list = players.map(p => ({
      id: p.id,
      name: p.name,
      net: Math.round(netsMap[p.id] || 0),
    }));
    return list.filter(x => x.net !== 0);
  }, [players, netsMap]);

  const transfers = useMemo(() => computeSettlements(netsList), [netsList]);

  if (loading) return <div className="container"><h1 className="mb-3">Settlements</h1><p className="label-muted">Loading…</p></div>;
  if (err) return <div className="container"><h1 className="mb-3">Settlements</h1><p className="label-muted">Error: {err}</p></div>;

  const totalPositive = netsList.filter(x => x.net > 0).reduce((s, x) => s + x.net, 0);
  const totalNegative = netsList.filter(x => x.net < 0).reduce((s, x) => s - x.net, 0);

  return (
    <div className="container">
      <h1 className="mb-4">Settlements</h1>

      <section className="card">
        <h2 className="mb-2">Summary</h2>
        <ul>
          {players.map(p => {
            const net = Math.round(netsMap[p.id] || 0);
            if (net === 0) return null;
            return (
              <li key={p.id} className="tabular-nums">
                <b>{p.name}</b>: {net > 0 ? "+" : ""}{net}
              </li>
            );
          })}
        </ul>
        <div className="label-muted mt-2 tabular-nums">
          Total +: <b>{totalPositive}</b> · Total -: <b>{totalNegative}</b>
        </div>
      </section>

      <section className="mt-6 card">
        <h2 className="mb-2">Who pays whom</h2>
        {transfers.length === 0 ? (
          <p className="label-muted">No transfers needed ✨</p>
        ) : (
          <ul>
            {transfers.map((t, i) => (
              <li key={i} className="tabular-nums">
                <b>{t.from}</b> → <b>{t.to}</b>: {t.amount}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6">
        <a className="btn btn-secondary" href={`/sessions/${sessionId}`}>Back to session</a>
      </div>
    </div>
  );
}
