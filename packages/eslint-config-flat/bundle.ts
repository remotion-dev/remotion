import {buildPackage} from '../.monorepo/builder';

const external = ['eslint', 'typescript-eslint', 'eslint-plugin-react-hooks'];
const cjs = await Bun.build({
	entrypoints: ['src/index.ts'],
	outdir: './dist',
	naming: 'index.cjs',
	target: 'node',
	format: 'cjs',
	external,
});

if (!cjs.success) {
	throw new AggregateError(
		cjs.logs,
		'Could not build the CommonJS ESLint config',
	);
}

await buildPackage({
	entrypoints: [{path: 'src/index.ts', target: 'node'}],
	formats: {
		cjs: 'do-nothing',
		esm: 'build',
	},
	external,
});
