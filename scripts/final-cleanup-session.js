const fs = require('fs');

const files = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = files.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// 1) حذف کاراکترهای نامرئی
s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');

// 2) حذف خطوط یتیم که قبلاً باید داخل آبجکت useCountdown می‌بودند
//   (این‌ها همان‌هایی هستند که در خروجی‌ات دیدیم: duration_min*60000; started_at ... ; ?? "running",)
const orphanPatterns = [
  /^\s*\(typeof\s+session[^\n]*duration_min[^\n]*\* 60000;[ \t]*\r?\n/mg,
  /^\s*typeof\s+session[^\n]*started_at[^\n]*\r?\n/mg,
  /^\s*\(typeof\s+session[^\n]*\?\?\s*"running",[ \t]*\r?\n/mg,
];
// اعمال
orphanPatterns.forEach(re => { s = s.replace(re, ''); });

// 3) اگر درست قبل از «const onPause» یک خط «});» یتیم مانده باشد، همان را بردار
s = s.replace(/^\s*\}\);\s*(?=\n\s*const\s+onPause)/m, '');

// 4) نسخهٔ تکراری هندلرها را حذف کن (اولی را نگه می‌داریم)
function dedupeHandler(name) {
  let count = 0;
  const re = new RegExp(
    String.raw`^\s*const\s+${name}\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\};\s*`,
    'mg'
  );
  s = s.replace(re, (m) => (++count === 1 ? m : ''));
}
["onPause", "onResume", "finishSessionAndGo"].forEach(dedupeHandler);

// 5) تمیزکاری فاصله‌های اضافه
s = s.replace(/\n{3,}/g, '\n\n');

// 6) ذخیره
if (s !== orig) {
  fs.writeFileSync(file + ".bak_cleanup", orig, "utf8");
  fs.writeFileSync(file, s, "utf8");
  console.log("✅ cleaned orphan lines and duplicate handlers in", file);
} else {
  console.log("ℹ️ no change");
}
