import {build} from 'bun';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const presentations = ['slide', 'flip', 'wipe', 'fade', 'clock-wipe', 'none'];

const output = await build({
	entrypoints: [
		'src/index.ts',
		...presentations.map((p) => `src/presentations/${p}.tsx`),
	],
	external: [
		'remotion',
		'remotion/no-react',
		'react',
		'react/jsx-runtime',
		'react/jsx-runtime',
		'react/jsx-dev-runtime',
		'@remotion/paths',
		'@remotion/shapes',
	],
	naming: '[name].mjs',
});

for (const file of output.outputs) {
	const str = await file.text();
	const newStr = str;

	Bun.write(path.join('dist', 'esm', file.path), newStr);
}
