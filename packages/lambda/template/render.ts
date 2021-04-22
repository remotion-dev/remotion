import {openBrowser, renderFrames} from '@remotion/renderer';
import fs from 'fs';

const chromium = require('chrome-aws-lambda');

export const handler = async (params: {serveUrl: string}) => {
	console.log('CONTEXT', params);
	const outputDir = '/tmp/' + 'remotion-render-' + Math.random();
	fs.mkdirSync(outputDir);
	const browserInstance = await openBrowser('chrome', {
		customExecutable: await chromium.executablePath,
	});

	await renderFrames({
		compositionId: 'my-video',
		config: {
			durationInFrames: 20,
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
		puppeteerInstance: browserInstance,
		serveUrl: params.serveUrl,
	});
	console.log('Done rendering!', outputDir);
};
