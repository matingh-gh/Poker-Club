const fs = require('fs');

const files = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = files.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// 0) حذف کاراکترهای نامرئی که معمولا مشکل‌سازند
s = s.replace(/[\u200B-\u200D\uFEFF]/g, ''); // ZWSP, ZWNJ, ZWJ, BOM

// 1) اطمینان از ایمپورت‌ها
function ensureImport(line) {
  if (!s.includes(line)) {
    if (/^["']use client["'];?/.test(s.split('\n')[0])) {
      const lines = s.split('\n'); lines.splice(1, 0, line); s = lines.join('\n');
    } else {
      s = line + '\n' + s;
    }
  }
}
ensureImport('import { useRouter } from "next/navigation";');
if (!/function\s+formatHMS|const\s+formatHMS/.test(s)) {
  ensureImport('import { useCountdown, formatHMS } from "@/lib/useCountdown";');
} else {
  ensureImport('import { useCountdown } from "@/lib/useCountdown";');
}

// 2) بازه‌ای که از بعدِ شروع تابع تا قبل از onPause است را بازنویسی کنیم
const reFuncStart = /(export\s+default\s+(?:async\s+)?function\s+SessionClient\s*\([^)]*\)\s*\{\s*)/;
const m = s.match(reFuncStart);
if (!m) { console.error("❌ cannot find function SessionClient(...) {"); process.exit(1); }
const funcStartPos = m.index + m[0].length;

// نقطه شروع: اگر router را داریم، از همان خط؛ وگرنه از ابتدای بدنهٔ تابع
let startPos = s.indexOf('const router = useRouter();', funcStartPos);
if (startPos === -1) startPos = funcStartPos;

// نقطه پایان: قبل از اولین هندلر شناخته‌شده
let endPos = s.indexOf('const onPause', startPos);
if (endPos === -1) endPos = s.indexOf('const onResume', startPos);
if (endPos === -1) endPos = s.indexOf('const finishSession', startPos);
// اگر هیچ‌کدام نبود، تا همون startPos فقط درج می‌کنیم
if (endPos === -1) endPos = startPos;

// 3) بلوک سالم جایگزین
const cleanBlock = `
  const router = useRouter();

  const durationMs =
    (typeof session !== "undefined" && session?.duration_min != null
      ? session.duration_min
      : 180) * 60000;

  const startedAtMs =
    (typeof session !== "undefined" && session?.started_at
      ? new Date(session.started_at).getTime()
      : Date.now());

  const { remainingMs, status, pause, resume, setStatus } = useCountdown({
    startedAt: startedAtMs,
    durationMs,
    initialStatus: (typeof session !== "undefined" && (session as any)?.status) ?? "running",
  });
`;

// 4) بازنویسی بازه
s = s.slice(0, startPos) + cleanBlock + s.slice(endPos);

// 5) تمیزکاری فاصله‌ها
s = s.replace(/\n{3,}/g, '\n\n');

// 6) ذخیره
if (s !== orig) {
  fs.writeFileSync(file + ".bak_reset", orig, "utf8");
  fs.writeFileSync(file, s, "utf8");
  console.log("✅ hard-reset timer block between router and first handler in", file);
} else {
  console.log("ℹ️ no change");
}
