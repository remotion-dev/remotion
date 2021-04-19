import {isHomebrewInstalled, renderFrames} from '@remotion/renderer';
import lambdafs from 'lambdafs';
import path from 'path';

const chromium = require('chrome-aws-lambda');

declare global {
	const REMOTION_BUNDLE: string;
}

export const handler = async (event, context, callback) => {
	console.log(REMOTION_BUNDLE);
	console.log(process.env.PUPPETEER_DOWNLOAD_PATH);
	console.log('Remotion is running', await isHomebrewInstalled());

	await lambdafs.inflate(
		path.join(process.cwd(), 'node_modules', 'bin', 'swiftshader.tar.br')
	);
	await lambdafs.inflate(
		path.join(process.cwd(), 'node_modules', 'bin', 'aws.tar.br')
	);

	console.log('inflated');
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
		customExecutable: await lambdafs.inflate(
			path.join(process.cwd(), 'node_modules', 'bin', 'chromium.br')
		),
	});
	console.log('Done rendering!', outputDir);
};
