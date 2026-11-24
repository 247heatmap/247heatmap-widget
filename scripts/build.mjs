import { spawnSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

const banner = `/*!
 * 247heatmap-widget
 * Free live stock, ETF, and crypto heatmap embeds from https://247heatmap.com/embed/
 * MIT License — Copyright (c) 2026 247heatmap.com
 */`;

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

const shared = {
  bundle: true,
  target: ["es2018"],
  banner: { js: banner },
  legalComments: "none",
  logLevel: "info",
};

await build({
  ...shared,
  entryPoints: ["src/index.ts"],
  format: "esm",
  outfile: "dist/index.js",
});

await build({
  ...shared,
  entryPoints: ["src/index.ts"],
  format: "cjs",
  outfile: "dist/index.cjs",
});

await build({
  ...shared,
  entryPoints: ["src/web-component.ts"],
  format: "esm",
  outfile: "dist/web-component.js",
});

await build({
  ...shared,
  entryPoints: ["src/web-component.ts"],
  format: "iife",
  globalName: "Heatmap247Widget",
  outfile: "dist/heatmap-247.iife.js",
  minify: true,
});

await build({
  ...shared,
  entryPoints: ["src/react.tsx"],
  format: "esm",
  outfile: "dist/react.js",
  external: ["react", "react/jsx-runtime"],
  jsx: "automatic",
});

await build({
  ...shared,
  entryPoints: ["src/react.tsx"],
  format: "cjs",
  outfile: "dist/react.cjs",
  external: ["react", "react/jsx-runtime"],
  jsx: "automatic",
});

const tsc = spawnSync("npx", ["tsc", "-p", "tsconfig.build.json"], {
  stdio: "inherit",
  shell: false,
});

if (tsc.status !== 0) {
  process.exit(tsc.status ?? 1);
}
