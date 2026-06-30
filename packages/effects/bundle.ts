import path from 'path';
import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const effectEntrypoints = [
	'src/index.ts',
	'src/barrel-distortion.ts',
	'src/blur.ts',
	'src/burlap.ts',
	'src/checkerboard.ts',
	'src/chromatic-aberration.ts',
	'src/color-key.ts',
	'src/brightness.ts',
	'src/contrast.ts',
	'src/contour-lines.ts',
	'src/drop-shadow.ts',
	'src/duotone.ts',
	'src/emboss.ts',
	'src/evolve.ts',
	'src/fisheye.ts',
	'src/corner-pin.ts',
	'src/glow.ts',
	'src/grayscale.ts',
	'src/gridlines.ts',
	'src/halftone-linear-gradient.ts',
	'src/halftone.ts',
	'src/hue.ts',
	'src/dot-grid.ts',
	'src/pixel-dissolve.ts',
	'src/pixelate.ts',
	'src/invert.ts',
	'src/lines.ts',
	'src/linear-gradient.ts',
	'src/linear-gradient-tint.ts',
	'src/linear-progressive-blur.ts',
	'src/light-trail.ts',
	'src/mirror.ts',
	'src/noise.ts',
	'src/noise-displacement.ts',
	'src/pattern.ts',
	'src/radial-progressive-blur.ts',
	'src/rings.ts',
	'src/saturation.ts',
	'src/scanlines.ts',
	'src/scale.ts',
	'src/shine.ts',
	'src/shrinkwrap.ts',
	'src/speckle.ts',
	'src/thermal-vision.ts',
	'src/tint.ts',
	'src/translate.ts',
	'src/tv-signal-off.ts',
	'src/venetian-blinds.ts',
	'src/vignette.ts',
	'src/wave.ts',
	'src/waves.ts',
	'src/zigzag.ts',
	'src/white-noise.ts',
	'src/zoom-blur.ts',
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
