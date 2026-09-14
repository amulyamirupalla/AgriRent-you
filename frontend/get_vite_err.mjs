import { execSync } from 'child_process';
import fs from 'fs';
try {
  const out = execSync('npx vite build', { encoding: 'utf8' });
  fs.writeFileSync('vite_error.txt', out);
} catch (e) {
  const err = e.stdout ? e.stdout.toString() : '';
  const err2 = e.stderr ? e.stderr.toString() : '';
  fs.writeFileSync('vite_error.txt', err + '\n' + err2);
}
console.log('Wrote to vite_error.txt');
