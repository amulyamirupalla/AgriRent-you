import { execSync } from 'child_process';
try {
  execSync('npx vite build', { stdio: 'pipe' });
} catch (e) {
  console.log(e.stdout.toString());
  console.log(e.stderr.toString());
}
