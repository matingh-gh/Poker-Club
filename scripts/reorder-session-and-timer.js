const fs = require('fs');

const candidates = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = candidates.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// حذف کاراکترهای نامرئی
s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');

// الگوها
const reSessionDecl = /const\s*\[\s*session\s*,\s*setSession\s*\]\s*=\s*useState<[^>]*>\([^)]*\)\s*;/m;
const reDurationBlk = /const\s+durationMs\s*=\s*[\s\S]*?;\s*\n/m;
const reStartedBlk = /const\s+startedAtMs\s*=\s*[\s\S]*?;\s*\n/m;

const mSession = reSessionDecl.exec(s);
const mDuration = reDurationBlk.exec(s);
const mStarted  = reStartedBlk.exec(s);

if (!mSession || !mDuration || !mStarted) {
  console.error("❌ anchor(s) not found (session/durationMs/startedAtMs)");
  process.exit(1);
}

let changed = false;

function moveBlockAfterSession(match) {
  const block = match[0];
  const blockStart = match.index;
  const blockEnd = blockStart + block.length;

  const sessionEnd = mSession.index + mSession[0].length;

  // اگر قبل از session تعریف شده، جابه‌جا کن
  if (blockStart < sessionEnd) {
    // حذف بلاک از جای قبلی
    s = s.slice(0, blockStart) + s.slice(blockEnd);

    // چون حذف کردیم، ایندکس پایان session ممکنه عوض بشه؛ مجدداً پیدا کنیم
    const mNewSession = reSessionDecl.exec(s);
    const insertPos = mNewSession.index + mNewSession[0].length;

    // درج بعد از session
    s = s.slice(0, insertPos) + '\n\n' + block + s.slice(insertPos);
    changed = true;
  }
}

moveBlockAfterSession(mDuration);
moveBlockAfterSession(reDurationBlk.exec(s) || mDuration); // در صورت تغییر دوباره resolve شود
moveBlockAfterSession(reStartedBlk.exec(s) || mStarted);

if (changed) {
  fs.writeFileSync(file + ".bak_reorder", orig, "utf8");
  fs.writeFileSync(file, s, "utf8");
  console.log("✅ moved durationMs/startedAtMs to after session declaration in", file);
} else {
  console.log("ℹ️ already in the right order");
}
