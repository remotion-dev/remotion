import {build} from 'bun';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const output = await build({
	entrypoints: [
		'src/index.ts',
		'src/readers/from-web-file.ts',
		'src/readers/from-fetch.ts',
		'src/readers/from-node.ts',
		'src/writers/buffer.ts',
		'src/writers/web-fs.ts',
	],
	external: ['stream'],
	naming: '[name].mjs',
	target: 'node',
});
if (!output.success) {
	process.exit(1);
}

for (const file of output.outputs) {
	const str = await file.text();
	const out = path.join('dist', 'esm', file.path);

	await Bun.write(out, str);
}
