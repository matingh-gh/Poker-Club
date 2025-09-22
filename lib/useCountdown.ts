import { useEffect, useRef, useState } from "react";
type Status = "running" | "paused" | "finished";

export function useCountdown(opts: { startedAt: number; durationMs: number; initialStatus?: Status }) {
  const { startedAt, durationMs, initialStatus = "running" } = opts;
  const [status, setStatus] = useState<Status>(initialStatus);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      const now = Date.now();
      const elapsed = now - startedAt - pausedTotalRef.current;
      const rem = durationMs - elapsed;
      setRemainingMs(rem > 0 ? rem : 0);
      if (rem <= 0) setStatus("finished");
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [status, durationMs, startedAt]);

  const pause = () => {
    if (status !== "running") return;
    pausedAtRef.current = Date.now();
    setStatus("paused");
  };

  const resume = () => {
    if (status !== "paused") return;
    if (pausedAtRef.current) {
      pausedTotalRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setStatus("running");
  };

  const reset = () => {
    pausedAtRef.current = null;
    pausedTotalRef.current = 0;
    setStatus("running");
  };

  return { remainingMs, status, pause, resume, reset, setStatus };
}

export function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const two = (n: number) => n.toString().padStart(2, "0");
  return `${two(hh)}:${two(mm)}:${two(ss)}`;
}
