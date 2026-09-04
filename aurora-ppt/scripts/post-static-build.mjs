import { copyFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PPT_VERSION = "18";

const root = dirname(fileURLToPath(import.meta.url));
const appRoot = join(root, "../..");
const pptDir = join(appRoot, "public/aurora-ppt");
const assetsDir = join(pptDir, "assets");
const flatAssetsDir = join(appRoot, "public/assets");
const rootHtml = join(appRoot, "public/aurora-ppt.html");
const redirectHtml = join(pptDir, "index.html");

const redirect = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url=../aurora-ppt.html" />
    <title>Redirecting — Aurora Studio PPT</title>
    <script>location.replace("../aurora-ppt.html");</script>
  </head>
  <body style="margin:0;background:#0A0A0C;color:#F2EEE6;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center">
    <p>Redirecting to <a href="../aurora-ppt.html" style="color:#D4A373">Aurora Studio PPT</a>…</p>
  </body>
</html>
`;

writeFileSync(redirectHtml, redirect, "utf8");

const loadingRoot = `<div id="root">
      <div style="display:flex;min-height:100vh;align-items:center;justify-content:center;background:#0A0A0C;color:#F2EEE6;font-family:Manrope,system-ui,sans-serif">
        <div style="text-align:center">
          <h1 style="font-family:Fraunces,serif;font-weight:300;font-size:2rem;margin:0">Aurora Studio PPT</h1>
          <p style="margin-top:.75rem;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#9A9AA3">Loading editor…</p>
        </div>
      </div>
    </div>`;

writeFileSync(
  rootHtml,
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aurora Studio PPT — Living Slide Editor</title>
    <meta name="description" content="Canvas-native presentation editor with editorial typography and 60fps editing." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Manrope:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap" />
    <link rel="stylesheet" href="assets/aurora-ppt-spa.css?v=${PPT_VERSION}" />
  </head>
  <body>
    ${loadingRoot}
    <script type="module" src="assets/aurora-ppt-spa.js?v=${PPT_VERSION}"></script>
  </body>
</html>
`,
  "utf8",
);

const built = readdirSync(assetsDir);
const js = built.find((f) => f.endsWith(".js"));
const css = built.find((f) => f.endsWith(".css"));
if (js) copyFileSync(join(assetsDir, js), join(flatAssetsDir, "aurora-ppt-spa.js"));
if (css) copyFileSync(join(assetsDir, css), join(flatAssetsDir, "aurora-ppt-spa.css"));
for (const f of built.filter((x) => x.endsWith(".jpg") || x.endsWith(".png") || x.endsWith(".webp"))) {
  copyFileSync(join(assetsDir, f), join(flatAssetsDir, f));
}

console.log(`Synced aurora-ppt.html (v${PPT_VERSION}) and assets/aurora-ppt-spa.*`);
