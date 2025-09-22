const fs = require('fs');

const candidates = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = candidates.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// 0) حذف کاراکترهای نامرئی
s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');

// 1) اطمینان از import ها
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

// 2) محدوده‌ی شروع/پایان برای بازنویسی
const startMarker = 'const { remainingMs, status, pause, resume, setStatus } = useCountdown({';
const endRegex = /const\s*\[\s*session\s*,\s*setSession\s*\]/;

const start = s.indexOf(startMarker);
const endMatch = endRegex.exec(s);
if (start === -1 || !endMatch) {
  console.error("❌ anchors not found (useCountdown block or [session,setSession])");
  process.exit(1);
}
const end = endMatch.index;

// 3) بلاک تمیز و نهایی
const cleanBlock = `
${startMarker}
  startedAt: startedAtMs,
  durationMs,
  initialStatus: (typeof session !== "undefined" && (session as any)?.status) ?? "running",
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
`;

// 4) جایگزینی بازه و حذف خطوط یتیم احتمالی
s = s.slice(0, start) + cleanBlock + s.slice(end);
s = s
  // هرگونه باقی‌مانده‌ی خطوط duration/started_at یتیم
  .replace(/^\s*\(typeof\s+session[^\n]*duration_min[^\n]*\* 60000;\s*$/mg, '')
  .replace(/^\s*typeof\s+session[^\n]*started_at[^\n]*$/mg, '')
  .replace(/^\s*\(typeof\s+session[^\n]*\?\?\s*"running",\s*$/mg, '')
  // نسخه‌های تکراری هندلرها
  .replace(/^\s*const\s+onPause\s*=\s*async[\s\S]*?\};\s*\n(?=[\s\S]*const)/m, (m, offset) => m) // اولی را نگه می‌داریم
  .replace(/^\s*const\s+onPause\s*=\s*async[\s\S]*?\};\s*/mg, (m, i) => (i===0?m:'')) // بقیه را حذف
  .replace(/^\s*const\s+onResume\s*=\s*async[\s\S]*?\};\s*/mg, (m, i) => (i===0?m:''))
  .replace(/^\s*const\s+finishSessionAndGo\s*=\s*async[\s\S]*?\};\s*/mg, (m, i) => (i===0?m:''))
  .replace(/\n{3,}/g, '\n\n');

if (s !== orig) {
  fs.writeFileSync(file + ".bak_reshape", orig, "utf8");
  fs.writeFileSync(file, s, "utf8");
  console.log("✅ reshaped countdown block and removed orphan/duplicate lines in", file);
} else {
  console.log("ℹ️ no change");
}
