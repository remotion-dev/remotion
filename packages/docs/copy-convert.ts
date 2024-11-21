import {$} from 'bun';
import fs from 'fs';
import path from 'path';

await $`bunx turbo "@remotion/convert#build-spa"`;

const dir = path.join(__dirname, '../convert/spa-dist/client');

fs.cpSync(dir, path.join(__dirname, './build/convert'), {recursive: true});
