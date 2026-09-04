import { copyFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const appRoot = join(root, "../..");
const pptDir = join(appRoot, "public/aurora-ppt");
const assetsDir = join(pptDir, "assets");
const flatAssetsDir = join(appRoot, "public/assets");
const spaHtml = join(pptDir, "spa.html");
const indexHtml = join(pptDir, "index.html");
const rootHtml = join(appRoot, "public/aurora-ppt.html");

copyFileSync(spaHtml, indexHtml);

let html = readFileSync(spaHtml, "utf8");
html = html.replace(/\.\/assets\/[^"']+\.js/g, "assets/aurora-ppt-spa.js");
html = html.replace(/\.\/assets\/[^"']+\.css/g, "assets/aurora-ppt-spa.css");
html = html.replace(/<div id="root"><\/div>/, `<div id="root">
      <div style="display:flex;min-height:100vh;align-items:center;justify-content:center;background:#0A0A0C;color:#F2EEE6;font-family:Manrope,system-ui,sans-serif">
        <div style="text-align:center">
          <h1 style="font-family:Fraunces,serif;font-weight:300;font-size:2rem;margin:0">Aurora Studio PPT</h1>
          <p style="margin-top:.75rem;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#9A9AA3">Loading editor…</p>
        </div>
      </div>
    </div>`);
writeFileSync(rootHtml, html, "utf8");

// Flat copies for fast FTP deploy (aurora-ppt.html loads assets/aurora-ppt-spa.*)
const built = readdirSync(assetsDir);
const js = built.find((f) => f.endsWith(".js"));
const css = built.find((f) => f.endsWith(".css"));
if (js) copyFileSync(join(assetsDir, js), join(flatAssetsDir, "aurora-ppt-spa.js"));
if (css) copyFileSync(join(assetsDir, css), join(flatAssetsDir, "aurora-ppt-spa.css"));
for (const f of built.filter((x) => x.endsWith(".jpg") || x.endsWith(".png") || x.endsWith(".webp"))) {
  copyFileSync(join(assetsDir, f), join(flatAssetsDir, f));
}

console.log("Synced aurora-ppt/index.html, public/aurora-ppt.html, and assets/aurora-ppt-spa.*");
