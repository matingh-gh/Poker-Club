const fs = require('fs');

const files = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = files.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// 1) همهٔ importهای useCountdown موجود را حذف کن
s = s.replace(/^\s*import\s*\{[^}]*\}\s*from\s*["']@\/lib\/useCountdown["'];?\s*$/mg, '');

// 2) import useRouter تکراری را هم حذف کن
s = s.replace(/^\s*import\s*\{\s*useRouter\s*\}\s*from\s*["']next\/navigation["'];?\s*$/mg, '');

// 3) اگر داخل فایل خودت formatHMS تعریف شده، دیگر importش نکن
const hasLocalFormat = /\b(function|const)\s+formatHMS\b/.test(s);
const importLine = `import { useCountdown${hasLocalFormat ? "" : ", formatHMS"} } from "@/lib/useCountdown";`;
const routerLine = `import { useRouter } from "next/navigation";`;

// 4) دو import بالا را بعد از "use client" (اگر هست) یا ابتدای فایل بگذار
if (/^["']use client["'];?/.test(s.split('\n')[0])) {
  const lines = s.split('\n');
  lines.splice(1, 0, routerLine, importLine);
  s = lines.join('\n');
} else {
  s = routerLine + "\n" + importLine + "\n" + s;
}

// 5) تمیزکاری
s = s.replace(/\n{3,}/g, "\n\n");

if (s !== orig) {
  fs.writeFileSync(file + ".bak2", orig);
  fs.writeFileSync(file, s);
  console.log("✅ fixed imports in", file);
} else {
  console.log("ℹ️ no change");
}
