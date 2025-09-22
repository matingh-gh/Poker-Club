const fs = require('fs');

const candidates = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = candidates.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// پیدا کردن شروع بلاک: از خطی که با "const { remainingMs" شروع می‌شود تا اولین "});"
let start = s.indexOf('const { remainingMs');
if (start === -1) {
  // اگر الگوی دقیق نبود، از useCountdown({ شروع کن و برو عقب تا const {
  const idxUC = s.indexOf('useCountdown({');
  if (idxUC === -1) { console.error('❌ cannot find useCountdown({'); process.exit(1); }
  const idxConst = s.lastIndexOf('const {', idxUC);
  if (idxConst === -1) { console.error('❌ cannot locate "const { ... } = useCountdown("'); process.exit(1); }
  start = idxConst;
}
const end = s.indexOf('});', start);
if (end === -1) { console.error('❌ cannot find closing "});" for useCountdown block'); process.exit(1); }

const SNIPPET = `
  const { remainingMs, status, pause, resume, setStatus } = useCountdown({
    startedAt: startedAtMs,
    durationMs,
    initialStatus: (typeof session !== "undefined" && (session as any)?.status) ?? "running",
  });
`;

s = s.slice(0, start) + SNIPPET + s.slice(end + 3);

// اگر durationMs/startedAtMs نیستند، بعد از router اضافه کن
if (!/const\s+durationMs\s*=/.test(s) || !/const\s+startedAtMs\s*=/.test(s)) {
  const routerPos = s.indexOf('const router = useRouter();');
  const insertPos = routerPos >= 0 ? routerPos + 'const router = useRouter();'.length : (s.indexOf('{') + 1);
  const PRE = `
  const durationMs = (typeof session !== "undefined" && session?.duration_min != null ? session.duration_min : 180) * 60000;
  const startedAtMs = (typeof session !== "undefined" && session?.started_at ? new Date(session.started_at).getTime() : Date.now());
`;
  s = s.slice(0, insertPos) + PRE + s.slice(insertPos);
}

// تمیزکاری فاصله‌های خالی زیاد
s = s.replace(/\n{3,}/g, '\n\n');

if (s !== orig) {
  fs.writeFileSync(file + '.bak_shape', orig);
  fs.writeFileSync(file, s);
  console.log('✅ reshaped useCountdown block in', file);
} else {
  console.log('ℹ️ no change');
}
