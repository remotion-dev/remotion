import {bundle} from '@remotion/bundler';
import {
	combineVideos,
	getCompositions,
	RenderInternals,
	renderMedia,
} from '@remotion/renderer';
import path from 'path';
import {webpackOverride} from './webpack-override';

const start = async () => {
	const bundled = await bundle('src/index.tsx', () => undefined, {
		webpackOverride: webpackOverride,
	});

	const comps = await getCompositions(bundled);

	for (let i = 0; i < 6; i++) {
		await renderMedia({
			codec: 'h264-mkv',
			composition: comps.find((c) => c.id === 'remote-video')!,
			outputLocation: path.join('out/there' + i + '.mkv'),
			serveUrl: bundled,
		});
	}

	await combineVideos({
		codec: 'h264',
		filelistDir: RenderInternals.tmpDir('remotion-file-lists'),
		files: new Array(6).fill(true).map((_, i) => {
			return path.join('out/there' + i + '.mkv');
		}),
		fps: 30,
		numberOfFrames: 300,
		onProgress: () => console.log('progress'),
		output: 'out/combined.mp4',
	});
};

start();
