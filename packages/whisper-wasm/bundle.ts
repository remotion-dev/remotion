import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		cjs: 'use-tsc',
		esm: 'build',
	},
	external: [
		'onnxruntime-web',
		'onnxruntime-common',
		'@huggingface/transformers',
	],
	entrypoints: [
		{
			path: 'src/index.module.ts',
			target: 'browser',
		},
		{
			path: 'src/worker.ts',
			target: 'browser',
		},
		{
			path: 'src/worker-url.ts',
			target: 'browser',
		},
	],
});
