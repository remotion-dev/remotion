import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'do-nothing',
		esm: 'build',
	},
	external: ['remotion', 'react', 'react-dom', 'mediabunny'],
	entrypoints: [{path: 'src/index.ts', target: 'browser'}],
});
