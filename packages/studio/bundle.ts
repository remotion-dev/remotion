import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const mainModule = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	external: ['react', 'remotion', 'remotion/no-react', 'react/jsx-runtime'],
});

const [file] = mainModule.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

const internalsModule = await build({
	entrypoints: ['src/internals.ts'],
	naming: 'internals.mjs',
	external: [
		'react',
		'remotion',
		'scheduler',
		'react-dom',
		'react',
		'@remotion/media-utils',
		'@remotion/studio-shared',
		'@remotion/zod-types',
		'@remotion/renderer',
		'@remotion/player',
		'@remotion/renderer/client',
		'@remotion/renderer/pure',
		'@remotion/renderer/error-handling',
		'source-map',
		'zod',
		'remotion/no-react',
		'react/jsx-runtime',
	],
});
const [enableFile] = internalsModule.outputs;
const internalsText = (await enableFile.text())
	.replace(/jsxDEV/g, 'jsx')
	.replace(/@remotion\/renderer\/client/g, '@remotion/renderer/client.js')
	.replace(/@remotion\/renderer\/pure/g, '@remotion/renderer/pure.js')
	.replace(/react\/jsx-dev-runtime/g, 'react/jsx-runtime');

await Bun.write('dist/esm/internals.mjs', internalsText);

export {};
