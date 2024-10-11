import {dir} from '@remotion/compositor-linux-arm64-gnu';
import fs, {cpSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {FUNCTION_ZIP_ARM64} from './src/shared/function-zip-path';

import zl from 'zip-lib';

const outdir = path.join(__dirname, `build-render`);
fs.mkdirSync(outdir, {
	recursive: true,
});
const outfile = path.join(outdir, 'index.js');

fs.rmSync(outdir, {recursive: true});
fs.mkdirSync(outdir, {recursive: true});
const template = require.resolve(
	path.join(__dirname, 'src', 'functions', 'index'),
);

const resul = await Bun.build({
	entrypoints: [template],
	target: 'node',
	minify: false,
});
if (!resul.success) {
	console.error(resul.logs);
	process.exit(1);
}

await Bun.write(outfile, resul.outputs[0]);

const filesInCwd = readdirSync(dir);
const filesToCopy = filesInCwd.filter(
	(f) =>
		f.startsWith('remotion') ||
		f.endsWith('.so') ||
		f.endsWith('.dll') ||
		f.endsWith('.dylib') ||
		f.startsWith('ffmpeg') ||
		f.startsWith('ffprobe'),
);
for (const file of filesToCopy) {
	cpSync(path.join(dir, file), path.join(outdir, file));
}

fs.cpSync(
	path.join(
		__dirname,
		'..',
		'renderer',
		'node_modules',
		'source-map',
		'lib',
		'mappings.wasm',
	),
	`${outdir}/mappings.wasm`,
);
await zl.archiveFolder(outdir, FUNCTION_ZIP_ARM64);

fs.rmSync(outdir, {recursive: true});
console.log('Bundled Lambda');
