import {bundle} from '@remotion/bundler';
import {
	RenderInternals,
	renderMedia,
	selectComposition,
} from '@remotion/renderer';
import path from 'node:path';
import {webpackOverride} from './src/webpack-override.mjs';

const start = async () => {
	const bundled = await bundle({
		entryPoint: './src/index.ts',
		webpackOverride,
	});

	const composition = await selectComposition({
		serveUrl: bundled,
		id: 'remote-video',
	});

	const filelistDir = RenderInternals.tmpDir('remotion-file-lists');

	const dur = 600;
	const framesPerLambda = 24;

	console.log(filelistDir);
	for (let i = 0; i < dur / framesPerLambda; i++) {
		await renderMedia({
			codec: 'h264',
			composition,
			outputLocation: path.join(filelistDir, 'out/there' + i + '.mkv'),
			serveUrl: bundled,
			frameRange: [i * framesPerLambda, (i + 1) * framesPerLambda - 1],
			concurrency: 1,
			numberOfGifLoops: null,
			everyNthFrame: 1,
			verbose: false,
			enforceAudioTrack: true,
		});
		console.log({i});
	}

	await RenderInternals.combineVideos({
		codec: 'h264',
		filelistDir,
		files: new Array(dur / framesPerLambda).fill(true).map((_, i) => {
			return path.join(filelistDir, 'out/there' + i + '.mkv');
		}),
		fps: 30,
		numberOfFrames: dur,
		onProgress: () => console.log('progress'),
		output: 'out/combined.mp4',
		numberOfGifLoops: null,
		audioCodec: 'aac',
	});

	RenderInternals.deleteDirectory(bundled);
};

start();
