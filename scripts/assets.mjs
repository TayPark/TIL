import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

fs.rmSync('public/source-assets', { recursive: true, force: true });
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0');
for (const file of files.filter(file => /\.(png|jpe?g|gif|webp|svg|avif|pdf)$/i.test(file))) {
  const target = path.join('public/source-assets', file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
}
