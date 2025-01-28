import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const formats = ['esm', 'cjs'] as const;

for (const format of formats) {
	const output = await build({
		entrypoints: ['src/index.ts'],
		naming: `[name].${format === 'esm' ? 'mjs' : 'js'}`,
		external: [],
		target: 'node',
	});

	const [file] = output.outputs;
	const text = await file.text();

	await Bun.write(
		`dist/${format}/index.${format === 'esm' ? 'mjs' : 'js'}`,
		text,
	);
}
