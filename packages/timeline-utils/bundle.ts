import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const output = await build({
	entrypoints: ['src/index.ts', 'src/audio-waveform-worker.ts'],
	naming: '[name].mjs',
	external: ['mediabunny'],
});

for (const file of output.outputs) {
	const text = await file.text();
	await Bun.write(`dist/esm/${file.path.split('/').pop()}`, text);
}

export {};
