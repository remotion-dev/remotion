import {$, build} from 'bun';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}
console.time('Generated.');

await $`bunx tailwindcss -i src/index.css -o dist/tailwind.css`;

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: [
		'remotion',
		'remotion/no-react',
		'react',
		'react/jsx-runtime',
		'react/jsx-runtime',
		'react/jsx-dev-runtime',
		'react-dom',
		'@remotion/paths',
		'@remotion/shapes',
		'@remotion/svg-3d-engine',
		'clsx',
		'tailwind-merge',
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
