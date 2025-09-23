const fs = require('fs');
const file = 'app/sessions/[id]/SessionClient.tsx';
let s = fs.readFileSync(file, 'utf8');

// 1) هر نسخه‌ی قبلی متغیرها/بلوک useCountdown را حذف کن
s = s
  .replace(/const\s+startedAtMs[\s\S]*?;\n/g, '')
  .replace(/const\s+durationMs[\s\S]*?;\n/g, '')
  .replace(/const\s*\{\s*remainingMs[\s\S]*?\}\);\n?/m, '');

// 2) بعد از useRouter و قبل از هر چیز، نسخه‌ی استاندارد را تزریق کن
s = s.replace(/const\s+router\s*=\s*useRouter\(\);\s*/m, (m) => m + `
const [session, setSession] = useState<SessionRow | null>(null);

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
`);

// 3) اگر هنوز جایی از فایل، useCountdown دوباره تزریق شده بود، پاکش کن (تضمین تک‌بار بودن)
s = s.replace(/^\s*const\s*\{\s*remainingMs[\s\S]*?\}\);\s*$/m, '');

fs.writeFileSync(file, s);
console.log('✅ normalized countdown block in', file);
