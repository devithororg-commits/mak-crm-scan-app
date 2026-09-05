import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const homeCss = fs.readFileSync(path.join(root, 'public/assets/aurora-home.css'), 'utf8');
let index;
const indexPath = path.join(root, 'public/index.html');
const src = process.argv[2] || indexPath;
if (src === 'git') {
  index = execSync('git show HEAD:public/index.html', { cwd: root, encoding: 'utf8' });
} else {
  index = fs.readFileSync(src, 'utf8');
}
const bodyMatch = index.match(/<body class="aurora-home">[\s\S]*/);
if (!bodyMatch) throw new Error('body not found in ' + src);

let body = bodyMatch[0].replace(/<script[\s\S]*?<\/script>\s*/g, '');
if (!body.endsWith('</body>')) body += '</body>';

const hub = `<!DOCTYPE html>
<html lang="en" style="background:#0a0a0c;color:#f2eee6">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <title>AURORA.STUDIO — Creative Operating System</title>
  <meta name="description" content="Design, present, and ship from one studio. Aurora Studio Pro, PPT, Canvas, NOVA Builder, and 176+ templates." />
  <meta name="theme-color" content="#0a0a0c" />
  <link rel="icon" href="favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=JetBrains+Mono:wght@500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
/* Aurora Hub — inline styles (cache-proof) */
${homeCss}
body.aurora-home { color: #f2eee6 !important; background: #0a0a0c !important; }
  </style>
  <link rel="stylesheet" href="assets/aurora-toolhub.css?v=25" />
</head>
${body}
  <script src="assets/aurora-toolhub.js?v=25"></script>
  <script src="assets/aurora-home.js?v=25"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'public/hub.html'), hub);
console.log('Wrote public/hub.html (' + hub.length + ' bytes)');
