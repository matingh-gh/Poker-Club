const fs = require('fs');

const files = [
  "app/sessions/[id]/SessionClient.tsx",
  "app/sessions/\\[id]/SessionClient.tsx",
];
const file = files.find(f => fs.existsSync(f));
if (!file) { console.error("❌ SessionClient.tsx not found"); process.exit(1); }

let s = fs.readFileSync(file, 'utf8');
const orig = s;

// 0) اطمینان از وجود import useRouter
if (!s.includes('from "next/navigation"')) {
  s = 'import { useRouter } from "next/navigation";\n' + s;
} else if (!/import\s*\{\s*useRouter\s*\}/.test(s)) {
  // اگر ایمپورت next/navigation هست ولی useRouter تو براکت‌ها نیست
  s = s.replace(/import\s*\{\s*([^}]*)\}\s*from\s*"next\/navigation";/,
                (m, inside) => `import { ${inside.split(',').map(x=>x.trim()).filter(Boolean).concat('useRouter').join(', ')} } from "next/navigation";`);
}

// 1) تمام خطوط تعریف router را حذف کن
s = s.replace(/^\s*const\s+router\s*=\s*useRouter\(\);\s*$/mg, '');

// 2) بعد از شروع تابع SessionClient یک بار تعریف router را درج کن
const reFuncStart = /(export\s+default\s+(?:async\s+)?function\s+SessionClient\s*\([^)]*\)\s*\{\s*)/;
if (reFuncStart.test(s)) {
  s = s.replace(reFuncStart, `$1  const router = useRouter();\n`);
} else {
  console.error("❌ cannot find function SessionClient(...) {");
  process.exit(1);
}

// 3) تمیزکاری فاصله‌های خالی اضافه
s = s.replace(/\n{3,}/g, '\n\n');

if (s !== orig) {
  fs.writeFileSync(file + ".bak3", orig);
  fs.writeFileSync(file, s);
  console.log("✅ fixed duplicate router declarations in", file);
} else {
  console.log("ℹ️ no change");
}
