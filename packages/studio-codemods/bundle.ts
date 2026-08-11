import path from 'path';
import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const external = ['@remotion/studio-shared'];

console.time('Generated.');
const esmOutput = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external,
});
const cjsOutput = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].cjs',
	format: 'cjs',
	external,
});

for (const output of [esmOutput, cjsOutput]) {
	if (!output.success) {
		console.log(output.logs.join('\n'));
		process.exit(1);
	}
}

for (const file of esmOutput.outputs) {
	const str = await file.text();
	await Bun.write(path.join('dist', 'esm', file.path), str);
}

for (const file of cjsOutput.outputs) {
	const str = await file.text();
	await Bun.write(path.join('dist', file.path), str);
}

console.timeEnd('Generated.');
