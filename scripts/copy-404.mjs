import { copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

copyFileSync(
  join(rootDir, 'public', '404.html'),
  join(rootDir, 'docs', '404.html')
);

console.log('✓ 404.html copied to docs/');

