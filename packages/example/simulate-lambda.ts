import {bundle} from '@remotion/bundler';
import {
	RenderInternals,
	renderMedia,
	selectComposition,
} from '@remotion/renderer';
import {$} from 'bun';
import path from 'node:path';
import {webpackOverride} from './src/webpack-override.mjs';
const bundled = await bundle({
	entryPoint: './src/index.ts',
	webpackOverride,
});

const composition = await selectComposition({
	serveUrl: bundled,
	id: 'OffthreadRemoteVideo',
});

const filelistDir = RenderInternals.tmpDir('remotion-file-lists');

const dur = 120;
const framesPerLambda = 24;

console.log(filelistDir);
for (let i = 0; i < dur / framesPerLambda; i++) {
	const outputLocation = path.join(filelistDir, 'out/there' + i + '.aac');
	await renderMedia({
		codec: 'aac',
		composition,
		outputLocation,
		serveUrl: bundled,
		frameRange: [i * framesPerLambda, (i + 1) * framesPerLambda - 1],
		concurrency: 1,
		numberOfGifLoops: null,
		everyNthFrame: 1,
		verbose: false,
		enforceAudioTrack: true,
	});
	await $`ffmpeg -i ${outputLocation} -y ${i}.wav`;
	console.log({i});
}

await RenderInternals.combineVideos({
	codec: 'aac',
	filelistDir,
	files: new Array(dur / framesPerLambda).fill(true).map((_, i) => {
		return path.join(filelistDir, 'out/there' + i + '.aac');
	}),
	fps: 30,
	numberOfFrames: dur,
	onProgress: () => console.log('progress'),
	output: path.join(__dirname, 'out/combined.mp4'),
	numberOfGifLoops: null,
	audioCodec: 'aac',
	audioBitrate: null,
	chunkDurationInSeconds: framesPerLambda / 30,
	indent: false,
	logLevel: 'verbose',
});

RenderInternals.deleteDirectory(bundled);
await $`ffmpeg -i ${path.join(__dirname, 'out/combined.mp4')} -y ${path.join(
	__dirname,
	'combined.wav',
)}`;
