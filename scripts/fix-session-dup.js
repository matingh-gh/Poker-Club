const fs = require('fs');
const file = 'app/sessions/[id]/SessionClient.tsx';
let s = fs.readFileSync(file, 'utf8');

// تمام تعریف‌های تکراری session را حذف کن
s = s.replace(/^[ \t]*const\s*\[\s*session\s*,\s*setSession\s*\]\s*=\s*useState[^\n]*\n/gm, '');

// نقطه‌ی تزریق بعد از const router = useRouter();
const routerRE = /const\s+router\s*=\s*useRouter\(\);\n?/;
let m = routerRE.exec(s);
let insertPos = 0;

if (m) {
  insertPos = m.index + m[0].length;
} else {
  // اگر router نبود، آن را بالای بدنه بعد از ایمپورت‌ها اضافه کن
  const firstStmt = s.search(/\n(?:const|let|useEffect|useMemo|useState|\{\s*remainingMs)/);
  insertPos = firstStmt > -1 ? firstStmt + 1 : 0;
  s = s.slice(0, insertPos) + 'const router = useRouter();\n' + s.slice(insertPos);
  insertPos += 'const router = useRouter();\n'.length;
}

// فقط یک تعریف استاندارد قرار بده
const sessionLine = 'const [session, setSession] = useState<SessionRow | null>(null);\n';
if (!s.includes(sessionLine)) {
  s = s.slice(0, insertPos) + sessionLine + s.slice(insertPos);
}

fs.writeFileSync(file, s, 'utf8');
console.log('✅ fixed duplicate session state declaration in', file);
