import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const pptDir = join(root, "../public/aurora-ppt");
const spaHtml = join(pptDir, "spa.html");
const indexHtml = join(pptDir, "index.html");
const rootHtml = join(root, "../public/aurora-ppt.html");

copyFileSync(spaHtml, indexHtml);

let html = readFileSync(spaHtml, "utf8");
html = html.replace(/\.\/assets\//g, "aurora-ppt/assets/");
writeFileSync(rootHtml, html, "utf8");

console.log("Synced aurora-ppt/index.html and public/aurora-ppt.html");
