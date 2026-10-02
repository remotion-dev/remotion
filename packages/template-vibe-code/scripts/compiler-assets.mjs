// The files of the browser bundler's Web Worker: the worker itself, Rspack
// compiled to WebAssembly and the WASI worker it runs in. They are served from
// public/compiler, see build-preview.mjs and use-compiler.ts.
export const compilerAssets = [
  "browser-bundler-worker.js",
  "rspack.wasm32-wasi.wasm",
  "wasi-worker-browser.mjs",
];
