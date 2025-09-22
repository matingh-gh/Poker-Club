const fs = require('fs');

// locate file
const files = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = files.find(f => fs.existsSync(f));
if (!file) {
  console.error("❌ SessionClient.tsx not found in:", files.join(", "));
  process.exit(1);
}
let src = fs.readFileSync(file, "utf8");
const original = src;

// 0) اگر قبلاً بلاک تزریق شده، حذفش کن (تا تکراری نشه)
const reOldBlock = /\n\s*const router = useRouter\(\);[\s\S]*?const finishSessionAndGo[\s\S]*?\n\};/m;
if (reOldBlock.test(src)) {
  src = src.replace(reOldBlock, "\n");
}

// 1) اگر داخل فایل تابع/کانست formatHMS داری، ایمپورتش رو حذف کن (conflict)
if (/function\s+formatHMS|const\s+formatHMS/.test(src)) {
  src = src.replace(
    /import\s*\{\s*useCountdown\s*,\s*formatHMS\s*\}\s*from\s*"@\/lib\/useCountdown";/,
    'import { useCountdown } from "@/lib/useCountdown";'
  );
}

// 2) import ها را مطمئن کن
function ensureImport(code, line) {
  if (code.includes(line)) return code;
  const lines = code.split('\n');
  // اگر خط اول "use client" است، بعد از آن ایمپورت کن
  if (/^["']use client["'];?/.test(lines[0])) {
    lines.splice(1, 0, line);
    return lines.join('\n');
  }
  return line + '\n' + code;
}
src = ensureImport(src, 'import { useRouter } from "next/navigation";');
src = ensureImport(src, 'import { useCountdown, formatHMS } from "@/lib/useCountdown";');

// 3) بلاک تزریق
const INJECT = `
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
`;

// 4) بلاک را «بعد از اولین تعریف session» بگذار؛ اگر پیداش نکرد، بلافاصله بعد از شروع تابع
const reFuncStart = /(export\s+default\s+(?:async\s+)?function\s+SessionClient\s*\([^)]*\)\s*\{\s*)/;
const mFunc = src.match(reFuncStart);
if (!mFunc) {
  console.error("❌ cannot find function SessionClient(...) {");
  process.exit(1);
}
let insertPos = mFunc.index + mFunc[0].length;

// دنبال اولین تعریف session بعد از شروع تابع
const afterFunc = src.slice(insertPos);
const mSess = afterFunc.match(/^\s*(?:const|let|var)\s+session\s*=.*$/m);
if (mSess) {
  insertPos += mSess.index + mSess[0].length;
}

// درج
src = src.slice(0, insertPos) + INJECT + src.slice(insertPos);

// 5) وایر دکمه‌ها
function addOnClick(label, handler) {
  const re = new RegExp(`<button(?![^>]*onClick=)([^>]*)>(\\s*)${label}(\\s*)<\\/button>`, 'g');
  src = src.replace(re, `<button$1 onClick={${handler}}>$2${label}$3</button>`);
}
addOnClick('Pause', 'onPause');
addOnClick('Resume', 'onResume');
addOnClick('Finish', 'finishSessionAndGo');

// 6) تایمر نمایش
src = src.replace(
  /(Time\s*left:\s*<\/div>\s*<div[^>]*>)[^<]+(<\/div>)/,
  `$1{formatHMS(remainingMs)}$2`
);

// 7) کلاس btn-resp روی دکمه‌های عمل
['Buy-in','Rebuy','Cashout'].forEach(lbl => {
  const re = new RegExp(`(<button[^>]*className=")([^"]*)("([^>]*>\\s*)${lbl}(\\s*)<\\/button>)`, 'g');
  src = src.replace(re, (m, p1, classes, rest) => {
    if (classes.includes('btn-resp')) return m;
    return `${p1}btn-resp ${classes}${rest}`;
  });
});

// write
if (src !== original) {
  fs.writeFileSync(file + ".bak", original, "utf8");
  fs.writeFileSync(file, src, "utf8");
  console.log("✅ repatched", file, "(backup:", file + ".bak", ")");
} else {
  console.log("ℹ️ no changes (already patched)");
}
