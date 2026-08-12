// Copies the pdfjs-dist worker script into public/ so it can be served as a
// static asset. Runs automatically via the "postinstall" npm script — this
// keeps the worker version always in lockstep with the installed pdfjs-dist
// package (a mismatch throws "API version does not match Worker version" at
// runtime), and works identically in local dev, CI, and Docker builds since
// `npm ci` runs postinstall hooks.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const source = join(
  projectRoot,
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"
);
const destDir = join(projectRoot, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

mkdirSync(destDir, { recursive: true });
copyFileSync(source, dest);
console.log("Copied pdf.worker.min.mjs to public/");
