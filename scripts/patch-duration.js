const fs = require('fs');
const p = 'app/sessions/[id]/SessionClient.tsx';
const s = fs.readFileSync(p, 'utf8');
fs.writeFileSync(p + '.bak_duration_field', s);
const out = s.replace(/\bduration_min\b/g, 'duration_minutes');
fs.writeFileSync(p, out);
console.log('✅ Replaced duration_min -> duration_minutes in', p);
