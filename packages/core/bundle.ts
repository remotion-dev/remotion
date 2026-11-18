import {mkdirSync, readdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import {build, semver, version} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

if (!semver.satisfies(version, '^1.1.7')) {
	// eslint-disable-next-line no-console
	console.error(
		`There is a bug with bundling when using Bun <1.1.7. You use ${version}. Please use a newer version`,
	);
	process.exit(1);
}

const outDir = path.join('dist', 'esm');

mkdirSync(outDir, {recursive: true});
for (const f of readdirSync(outDir)) {
	if (f.startsWith('chunk-')) {
		rmSync(path.join(outDir, f));
	}
}

const output = await build({
	entrypoints: ['src/index.ts', 'src/no-react.ts'],
	naming: {
		entry: '[name].mjs',
		chunk: 'chunk-[hash].mjs',
	},
	splitting: true,
	target: 'browser',
	external: ['remotion', 'react', 'react-dom'],
});

for (const file of output.outputs) {
	const name = path.basename(file.path);
	const text = await file.text();
	if (
		name !== 'index.mjs' &&
		(text.includes('createContext') || /from\s*["']react/.test(text))
	) {
		throw new Error('remotion/no-react.mjs should not import React');
	}

	await Bun.write(path.join(outDir, name), text);
}

const versionOutput = await build({
	entrypoints: ['src/version.ts'],
	naming: '[name].mjs',
	target: 'browser',
});

const [versionFile] = versionOutput.outputs;
await Bun.write(path.join(outDir, 'version.mjs'), await versionFile.text());

export {};

console.log('Done.');
