import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'public/hub.html'), 'utf8')
  .replace(/\/hub\.html/g, '/start.html');
fs.writeFileSync(path.join(root, 'public/start.html'), html);
console.log('Created public/start.html');
