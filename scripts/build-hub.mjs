/**
 * DEPRECATED — hub.html is maintained manually in public/hub.html.
 * This script previously overwrote hub.html with old aurora-home.css (caused invisible hero bugs).
 *
 * Use instead:
 *   node scripts/copy-start.mjs   — sync start.html from hub.html
 *   npm run build                 — copy-start + build dist
 */
console.error(
  'build-hub.mjs is disabled.\n' +
  '  Edit public/hub.html directly, then run: node scripts/copy-start.mjs\n' +
  '  Old generator used aurora-home.css and broke the landing page.'
);
process.exit(1);
