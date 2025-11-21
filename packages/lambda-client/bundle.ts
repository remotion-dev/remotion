import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'build',
		esm: 'build',
	},
	external: 'dependencies',
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'node',
		},
		{
			path: 'src/constants.ts',
			target: 'browser',
		},
		{path: 'src/regions.ts', target: 'browser'},
	],
});

const cjsContent = await Bun.file('./dist/cjs/index.js').text();
const cjsReplaced = cjsContent.replace(
	'if (i3 === 0 || i3 === -0)',
	'if (i3 === 0)',
);
await Bun.write('./dist/cjs/index.js', cjsReplaced);

const esmContent = await Bun.file('./dist/esm/index.mjs').text();
const esmReplaced = esmContent.replace(
	'if (i3 === 0 || i3 === -0)',
	'if (i3 === 0)',
);
await Bun.write('./dist/esm/index.mjs', esmReplaced);
