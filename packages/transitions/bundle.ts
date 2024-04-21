const presentations = ['slide', 'flip', 'wipe', 'fade', 'clock-wipe'];
import {build} from 'bun';
import path from 'path';

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
	const newStr = str
		.replace(/jsxDEV/g, 'jsx')
		.replace(/react\/jsx-dev-runtime/g, 'react/jsx-runtime');

	Bun.write(path.join('dist', 'esm', file.path), newStr);
}
