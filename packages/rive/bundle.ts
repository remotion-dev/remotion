import {build, revision} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

if (!revision.startsWith('07ce')) {
	// eslint-disable-next-line no-console
	console.warn('warn: Remotion currently uses a fork of Bun to bundle.');
	// eslint-disable-next-line no-console
	console.log(
		'You dont currently run the fork, this could lead to duplicate key warnings in React.',
	);
}

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: [
		'react/jsx-runtime',
		'@rive-app/canvas-advanced',
		'react',
		'remotion',
		'remotion/no-react',
	],
});

const [file] = output.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

export {};
