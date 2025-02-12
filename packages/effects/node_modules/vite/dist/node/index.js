export { parseAst, parseAstAsync } from 'rollup/parseAst';
import { i as isInNodeModules, a as arraify } from './chunks/dep-M1IYMR16.js';
export { B as BuildEnvironment, D as DevEnvironment, f as build, m as buildErrorMessage, g as createBuilder, C as createFilter, h as createIdResolver, G as createLogger, n as createRunnableDevEnvironment, c as createServer, w as createServerHotChannel, v as createServerModuleRunner, d as defineConfig, u as fetchModule, j as formatPostcssSourceMap, J as isFileLoadingAllowed, I as isFileServingAllowed, q as isRunnableDevEnvironment, l as loadConfigFromFile, K as loadEnv, A as mergeAlias, z as mergeConfig, x as moduleRunnerTransform, y as normalizePath, o as optimizeDeps, p as perEnvironmentPlugin, b as perEnvironmentState, k as preprocessCSS, e as preview, r as resolveConfig, L as resolveEnvPrefix, E as rollupVersion, H as searchForWorkspaceRoot, F as send, s as sortUserPlugins, t as transformWithEsbuild } from './chunks/dep-M1IYMR16.js';
export { DEFAULT_CLIENT_CONDITIONS as defaultClientConditions, DEFAULT_CLIENT_MAIN_FIELDS as defaultClientMainFields, DEFAULT_SERVER_CONDITIONS as defaultServerConditions, DEFAULT_SERVER_MAIN_FIELDS as defaultServerMainFields, VERSION as version } from './constants.js';
export { version as esbuildVersion } from 'esbuild';
import 'node:fs';
import 'node:fs/promises';
import 'node:path';
import 'node:url';
import 'node:util';
import 'node:perf_hooks';
import 'node:module';
import 'node:crypto';
import 'path';
import 'fs';
import 'node:child_process';
import 'node:http';
import 'node:https';
import 'tty';
import 'util';
import 'net';
import 'events';
import 'url';
import 'http';
import 'stream';
import 'os';
import 'child_process';
import 'node:os';
import 'node:dns';
import 'vite/module-runner';
import 'module';
import 'node:readline';
import 'node:process';
import 'node:buffer';
import 'node:events';
import 'crypto';
import 'node:assert';
import 'node:v8';
import 'node:worker_threads';
import 'zlib';
import 'buffer';
import 'https';
import 'tls';
import 'node:net';
import 'assert';
import 'node:querystring';
import 'node:zlib';

const CSS_LANGS_RE = (
  // eslint-disable-next-line regexp/no-unused-capturing-group
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/
);
const isCSSRequest = (request) => CSS_LANGS_RE.test(request);
class SplitVendorChunkCache {
  cache;
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  reset() {
    this.cache = /* @__PURE__ */ new Map();
  }
}
function splitVendorChunk(options = {}) {
  const cache = options.cache ?? new SplitVendorChunkCache();
  return (id, { getModuleInfo }) => {
    if (isInNodeModules(id) && !isCSSRequest(id) && staticImportedByEntry(id, getModuleInfo, cache.cache)) {
      return "vendor";
    }
  };
}
function staticImportedByEntry(id, getModuleInfo, cache, importStack = []) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  if (importStack.includes(id)) {
    cache.set(id, false);
    return false;
  }
  const mod = getModuleInfo(id);
  if (!mod) {
    cache.set(id, false);
    return false;
  }
  if (mod.isEntry) {
    cache.set(id, true);
    return true;
  }
  const someImporterIs = mod.importers.some(
    (importer) => staticImportedByEntry(
      importer,
      getModuleInfo,
      cache,
      importStack.concat(id)
    )
  );
  cache.set(id, someImporterIs);
  return someImporterIs;
}
function splitVendorChunkPlugin() {
  const caches = [];
  function createSplitVendorChunk(output, config) {
    const cache = new SplitVendorChunkCache();
    caches.push(cache);
    const build = config.build ?? {};
    const format = output.format;
    if (!build.ssr && !build.lib && format !== "umd" && format !== "iife") {
      return splitVendorChunk({ cache });
    }
  }
  return {
    name: "vite:split-vendor-chunk",
    config(config) {
      let outputs = config.build?.rollupOptions?.output;
      if (outputs) {
        outputs = arraify(outputs);
        for (const output of outputs) {
          const viteManualChunks = createSplitVendorChunk(output, config);
          if (viteManualChunks) {
            if (output.manualChunks) {
              if (typeof output.manualChunks === "function") {
                const userManualChunks = output.manualChunks;
                output.manualChunks = (id, api) => {
                  return userManualChunks(id, api) ?? viteManualChunks(id, api);
                };
              } else {
                console.warn(
                  "(!) the `splitVendorChunk` plugin doesn't have any effect when using the object form of `build.rollupOptions.output.manualChunks`. Consider using the function form instead."
                );
              }
            } else {
              output.manualChunks = viteManualChunks;
            }
          }
        }
      } else {
        return {
          build: {
            rollupOptions: {
              output: {
                manualChunks: createSplitVendorChunk({}, config)
              }
            }
          }
        };
      }
    },
    buildStart() {
      caches.forEach((cache) => cache.reset());
    }
  };
}

export { isCSSRequest, splitVendorChunk, splitVendorChunkPlugin };
