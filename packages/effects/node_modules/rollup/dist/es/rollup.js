/*
  @license
	Rollup.js v4.34.0
	Sat, 01 Feb 2025 08:39:54 GMT - commit 979d62888dbe75f92e50fdd64246c737c52f5f1f

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
export { version as VERSION, defineConfig, rollup, watch } from './shared/node-entry.js';
import './shared/parseAst.js';
import '../native.js';
import 'node:path';
import 'path';
import 'node:process';
import 'node:perf_hooks';
import 'node:fs/promises';
