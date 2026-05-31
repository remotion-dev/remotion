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
	'src/drop-shadow.ts',
	'src/duotone.ts',
	'src/fisheye.ts',
	'src/glow.ts',
	'src/grayscale.ts',
	'src/halftone-linear-gradient.ts',
	'src/halftone.ts',
	'src/hue.ts',
	'src/dot-grid.ts',
	'src/invert.ts',
	'src/lines.ts',
	'src/mirror.ts',
	'src/noise.ts',
	'src/saturation.ts',
	'src/scanlines.ts',
	'src/scale.ts',
	'src/shine.ts',
	'src/speckle.ts',
	'src/tint.ts',
	'src/translate.ts',
	'src/vignette.ts',
	'src/wave.ts',
	'src/white-noise.ts',
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
