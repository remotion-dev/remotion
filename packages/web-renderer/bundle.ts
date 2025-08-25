import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'do-nothing',
		esm: 'build',
	},
	external: ['remotion', 'react', 'react-dom'],
	entrypoints: [{path: 'src/index.tsx', target: 'browser'}],
});
