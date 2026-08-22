import path from 'path';
import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

console.time('Generated.');
const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: [
		'gsap',
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

// The declarations reference the ambient `gsap` namespace, but tsgo drops
// triple-slash directives on emit. Without this, consumers who don't import
// 'gsap' themselves get `any` for every timeline type. The directive resolves
// through the gsap package's own "types" field.
const gsapReference = '/// <reference types="gsap" />\n';
for (const declaration of ['dist/index.d.ts', 'dist/use-gsap-timeline.d.ts']) {
	const content = await Bun.file(declaration).text();
	if (!content.startsWith(gsapReference)) {
		await Bun.write(declaration, gsapReference + content);
	}
}

console.timeEnd('Generated.');
