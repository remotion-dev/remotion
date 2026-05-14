import path from 'path';
import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const effectEntrypoints = [
	'src/index.ts',
	'src/halftone.ts',
	'src/tint.ts',
	'src/wave.ts',
	'src/entrypoints/blur.ts',
];

console.time('Generated.');
const output = await build({
	entrypoints: effectEntrypoints,
	naming: '[name].mjs',
	external: [
		'remotion',
		'remotion/no-react',
		'react',
		'react/jsx-runtime',
		'react/jsx-dev-runtime',
		'react-dom',
	],
});

if (!output.success) {
	console.log(output.logs.join('\n'));
	process.exit(1);
}

for (const file of output.outputs) {
	const str = await file.text();
	const out = path.join('dist', 'esm', file.path);

	await Bun.write(out, str);
}

console.timeEnd('Generated.');
