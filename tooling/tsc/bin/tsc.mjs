#!/usr/bin/env node
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const packageJson = require.resolve('typescript/package.json');
const compiler = path.join(path.dirname(packageJson), 'lib/tsc.js');

await import(pathToFileURL(compiler).href);
