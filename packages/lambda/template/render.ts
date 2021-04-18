import {isHomebrewInstalled, renderFrames} from '@remotion/renderer';
import path from 'path';

declare global {
	const REMOTION_BUNDLE: string;
}

export const handler = async (event, context, callback) => {
	console.log(REMOTION_BUNDLE);
	console.log(process.env.PUPPETEER_DOWNLOAD_PATH);
	console.log('Remotion is running', await isHomebrewInstalled());

	const outputDir = '/tmp/' + 'remotion-render-' + Math.random();
	await renderFrames({
		compositionId: 'my-video',
		config: {
			durationInFrames: 10,
			fps: 30,
			height: 1080,
			width: 1080,
		},
		imageFormat: 'jpeg',
		inputProps: {},
		onFrameUpdate: (i: number) => {
			console.log('Rendered frames', i);
		},
		onStart: () => {
			console.log('Starting');
		},
		outputDir,
		webpackBundle: REMOTION_BUNDLE,
		customExecutable: path.join(
			__dirname,
			'node_modules',
			'bin',
			'chromium.br'
		),
	});
	console.log('Done rendering!', outputDir);
};
