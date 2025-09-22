const fs = require('fs');

const candidates = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = candidates.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// 0) حذف تمام تعریف‌های تکراری متغیرها و destruct
function removeAllLinesStartingWith(prefix) {
  const lines = s.split('\n');
  const out = [];
  for (const L of lines) {
    if (L.trim().startsWith(prefix)) continue;
    out.push(L);
  }
  s = out.join('\n');
}
function removeAllVar(name) {
  const re = new RegExp("^\\s*(?:const|let|var)\\s+" + name + "\\s*=", "m");
  let changed = false;
  let lines = s.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) { lines[i] = ''; changed = true; }
  }
  if (changed) s = lines.join('\n');
}

removeAllVar('durationMs');
removeAllVar('startedAtMs');
removeAllLinesStartingWith('const { remainingMs');
removeAllLinesStartingWith('const router = useRouter();');

// 1) بعد از شروع تابع SessionClient {...} موقعیت تزریق را پیدا کن
const reFuncStart = /(export\s+default\s+(?:async\s+)?function\s+SessionClient\s*\([^)]*\)\s*\{\s*)/;
const mFunc = s.match(reFuncStart);
if (!mFunc) { console.error("❌ cannot find function SessionClient(...) {"); process.exit(1); }
let insertPos = mFunc.index + mFunc[0].length;

// 2) یک تعریف سالم router + durationMs + startedAtMs + useCountdown بساز
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
    initialStatus:
      (typeof session !== "undefined" && (session as any)?.status) ?? "running",
  });
`;

// 3) بلاک را درج کن (در ابتدای بدنهٔ تابع)
s = s.slice(0, insertPos) + block + s.slice(insertPos);

// 4) تمیزکاری چند خط خالی
s = s.replace(/\n{3,}/g, '\n\n');

// 5) ذخیره
if (s !== orig) {
  fs.writeFileSync(file + ".bak_fix", orig);
  fs.writeFileSync(file, s);
  console.log("✅ normalized timer block in", file, "(backup:", file + ".bak_fix", ")");
} else {
  console.log("ℹ️ no change");
}
