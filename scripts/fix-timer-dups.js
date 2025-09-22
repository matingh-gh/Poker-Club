const fs = require('fs');

const files = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = files.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

function dedupeVar(name, replacementLine) {
  const lines = s.split('\n');
  const idxs = [];
  const re = new RegExp(`^\\s*(?:const|let|var)\\s+${name}\\s*=`);
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) idxs.push(i);
  }
  if (idxs.length === 0) {
    // اگر اصلاً نبود، چیزی اضافه نمی‌کنیم (قبلاً تزریق داریم)
    return;
  }
  // اولین مورد را با فرمول درست جایگزین کن
  lines[idxs[0]] = replacementLine;
  // بقیه را حذف کن
  for (let j = 1; j < idxs.length; j++) lines[idxs[j]] = null;
  s = lines.filter(l => l !== null).join('\n');
}

function dedupeLineStarts(prefix) {
  const lines = s.split('\n');
  const idxs = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(prefix)) idxs.push(i);
  }
  for (let j = 1; j < idxs.length; j++) lines[idxs[j]] = null;
  s = lines.filter(l => l !== null).join('\n');
}

// 1) durationMs
dedupeVar(
  "durationMs",
  '  const durationMs = (typeof session !== "undefined" && session?.duration_min != null ? session.duration_min : 180) * 60000;'
);

// 2) startedAtMs
dedupeVar(
  "startedAtMs",
  '  const startedAtMs = (typeof session !== "undefined" && session?.started_at ? new Date(session.started_at).getTime() : Date.now());'
);

// 3) فقط یک بار destruct از useCountdown
dedupeLineStarts('const { remainingMs');

// 4) تمیزکاری فاصله‌های اضافه
s = s.replace(/\n{3,}/g, '\n\n');

if (s !== orig) {
  fs.writeFileSync(file + ".bak4", orig);
  fs.writeFileSync(file, s);
  console.log("✅ deduped timer vars and useCountdown destruct in", file);
} else {
  console.log("ℹ️ no change");
}
