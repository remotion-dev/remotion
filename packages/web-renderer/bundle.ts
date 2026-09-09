import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'do-nothing',
		esm: 'build',
	},
	external: [
		'@remotion/media/internal',
		'remotion',
		'react',
		'react-dom',
		'mediabunny',
		'@mediabunny/mp3-encoder',
		'@mediabunny/aac-encoder',
		'@mediabunny/flac-encoder',
	],
	entrypoints: [{path: 'src/index.ts', target: 'browser'}],
});
