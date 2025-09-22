const fs = require('fs');
const path = require('path');

function loadFirstExisting(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const candidates = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx"
];
const file = loadFirstExisting(candidates);
if (!file) {
  console.error("❌ SessionClient.tsx not found. Checked:", candidates.join(", "));
  process.exit(1);
}

let src = fs.readFileSync(file, 'utf8');
const original = src;

// helper: add import lines right after "use client" (if present) or at top
function ensureImport(code, importLine) {
  if (code.includes(importLine)) return code;
  const hasUseClient = /^["']use client["'];?/m.test(code.split('\n')[0]);
  if (hasUseClient) {
    const lines = code.split('\n');
    lines.splice(1, 0, importLine);
    return lines.join('\n');
  }
  return importLine + '\n' + code;
}

// 1) imports
src = ensureImport(src, `import { useCountdown, formatHMS } from "@/lib/useCountdown";`);
src = ensureImport(src, `import { useRouter } from "next/navigation";`);

// 2) inject block after function start (only once)
if (!/useCountdown\(\{\s*startedAt:/.test(src)) {
  src = src.replace(
    /(export\s+default\s+(?:async\s+)?function\s+SessionClient\s*\([^)]*\)\s*\{\s*)/,
    `$1
  const router = useRouter();

  const durationMs =
    (typeof session !== "undefined" && session?.duration_min != null
      ? session.duration_min
      : 180) * 60000;

  const startedAtMs =
    typeof session !== "undefined" && session?.started_at
      ? new Date(session.started_at).getTime()
      : Date.now();

  const { remainingMs, status, pause, resume, setStatus } = useCountdown({
    startedAt: startedAtMs,
    durationMs,
    initialStatus:
      (typeof session !== "undefined" && (session as any)?.status) ?? "running",
  });

  const onPause = async () => {
    try { if (typeof pauseSessionInDb === "function") await (pauseSessionInDb)(id); }
    finally { pause(); setStatus("paused"); }
  };

  const onResume = async () => {
    try { if (typeof resumeSessionInDb === "function") await (resumeSessionInDb)(id); }
    finally { resume(); setStatus("running"); }
  };

  const finishSessionAndGo = async () => {
    try { if (typeof finishSessionInDb === "function") await (finishSessionInDb)(id); }
    finally { try { router.push(\`/sessions/\${id}/settlements\`); } catch (e) {} }
  };
`
  );
}

// 3) wire buttons: add onClick for Pause/Resume/Finish if missing
function wireButton(code, label, handler) {
  const re = new RegExp(`<button(?![^>]*onClick=)([^>]*)>(\\s*)${label}(\\s*)<\\/button>`, 'g');
  return code.replace(re, `<button$1 onClick={${handler}}>$2${label}$3</button>`);
}
src = wireButton(src, 'Pause', 'onPause');
src = wireButton(src, 'Resume', 'onResume');
src = wireButton(src, 'Finish', 'finishSessionAndGo');

// 4) make Buy-in/Rebuy/Cashout buttons responsive by prepending btn-resp to their className if present
function addBtnRespForLabel(code, label) {
  const re = new RegExp(`(<button[^>]*className=")([^"]*)("([^>]*>\\s*)${label}(\\s*)<\\/button>)`, 'g');
  return code.replace(re, (m, p1, classes, rest) => {
    if (classes.includes('btn-resp')) return m;
    return `${p1}btn-resp ${classes}${rest}`;
  });
}
['Buy-in','Rebuy','Cashout'].forEach(lbl => {
  src = addBtnRespForLabel(src, lbl);
});

// 5) optionally show formatted time if a simple Time left block exists (best-effort)
src = src.replace(
  /(Time\s*left:\s*<\/div>\s*<div[^>]*>)[^<]+(<\/div>)/,
  `$1{formatHMS(remainingMs)}$2`
);

// write back if changed
if (src !== original) {
  fs.writeFileSync(file + '.bak', original, 'utf8');
  fs.writeFileSync(file, src, 'utf8');
  console.log('✅ Patched:', file, '(backup:', file + '.bak', ')');
} else {
  console.log('ℹ️ No changes applied (file already patched or patterns not found).');
}
