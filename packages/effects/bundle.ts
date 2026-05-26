import {build} from 'bun';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const effectEntrypoints = [
	'src/index.ts',
	'src/barrel-distortion.ts',
	'src/blur.ts',
	'src/chromatic-aberration.ts',
	'src/brightness.ts',
	'src/contrast.ts',
	'src/duotone.ts',
	'src/glow.ts',
	'src/grayscale.ts',
	'src/halftone.ts',
	'src/hue.ts',
	'src/invert.ts',
	'src/mirror.ts',
	'src/saturation.ts',
	'src/scale.ts',
	'src/tint.ts',
	'src/translate.ts',
	'src/vignette.ts',
	'src/wave.ts',
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
