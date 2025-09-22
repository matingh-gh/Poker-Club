const fs = require('fs');

const files = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = files.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// 0) تضمین ایمپورت‌ها
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

// 1) تمام بلاک‌های قدیمی/ناقص useCountdown را حذف کن
const reOldBlock = /const\s*\{[^}]*\}\s*=\s*useCountdown\s*\(\s*\{[\s\S]*?\}\s*\)\s*;\s*/gm;
s = s.replace(reOldBlock, '');

// 2) تعریف‌های تکراری متغیرها را حذف کن
function dropAllVar(name){ s = s.replace(new RegExp("^\\s*(?:const|let|var)\\s+"+name+"\\s*=.*$","mg"), ''); }
dropAllVar('router');
dropAllVar('durationMs');
dropAllVar('startedAtMs');

// 3) پیدا کردن شروع تابع SessionClient و درج کد تمیز بعد از آن
const reFuncStart = /(export\s+default\s+(?:async\s+)?function\s+SessionClient\s*\([^)]*\)\s*\{\s*)/;
const m = s.match(reFuncStart);
if (!m) { console.error("❌ cannot find function SessionClient(...) {"); process.exit(1); }
let pos = m.index + m[0].length;

const block = `
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

// 4) درج بلوک تمیز
s = s.slice(0, pos) + block + s.slice(pos);

// 5) تمیزکاری چند خط خالی
s = s.replace(/\n{3,}/g, '\n\n');

// 6) ذخیره
if (s !== orig) {
  fs.writeFileSync(file + ".bak_strong", orig, "utf8");
  fs.writeFileSync(file, s, "utf8");
  console.log("✅ rewrote clean useCountdown block in", file);
} else {
  console.log("ℹ️ no change");
}
