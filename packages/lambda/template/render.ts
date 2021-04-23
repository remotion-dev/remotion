import {CreateBucketCommand, S3Client} from '@aws-sdk/client-s3';
import {
	openBrowser,
	renderFrames,
	stitchFramesToVideo,
} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {REGION, RENDERS_BUCKET_PREFIX} from '../src/constants';
import {executablePath} from './get-chromium-executable-path';

const s3Client = new S3Client({region: REGION});

type Await<T> = T extends PromiseLike<infer U> ? U : T;

let browserInstance: Await<ReturnType<typeof openBrowser>> | null;

const getBrowserInstance = async () => {
	if (browserInstance) {
		return browserInstance;
	}
	const execPath = await executablePath();
	console.log(await executablePath());
	browserInstance = await openBrowser('chrome', {
		customExecutable: execPath,
	});
	return browserInstance;
};

const totalFrames = 100;

export const handler = async (params: {
	serveUrl: string;
	type: 'init' | 'orchestrator';
}) => {
	console.log('CONTEXT', params);
	const outputDir = '/tmp/' + 'remotion-render-' + Math.random();
	fs.mkdirSync(outputDir);
	const bucketName = RENDERS_BUCKET_PREFIX + Math.random();

	await s3Client.send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);
	const instance = await getBrowserInstance();
	renderFrames({
		compositionId: 'my-video',
		config: {
			durationInFrames: totalFrames,
			fps: 30,
			height: 1080,
			width: 1080,
		},
		imageFormat: 'jpeg',
		inputProps: {},
		onFrameUpdate: (i: number, output: string) => {
			console.log('Rendered frames', i, output);
		},
		onStart: () => {
			console.log('Starting');
		},
		outputDir,
		puppeteerInstance: instance,
		serveUrl: params.serveUrl,
	});

	const outdir = `/tmp/${Math.random()}`;

	const outputLocation = path.join(outdir, 'out.mp4');

	await stitchFramesToVideo({
		assetsInfo: {
			// TODO
			assets: [],
			bundleDir: '',
		},
		dir: outputDir,
		force: true,
		// TODO
		fps: 30,
		// TODO
		height: 1080,
		//TODO,
		width: 1080,
		outputLocation,
		// TODO
		codec: 'h264',
		// TODO
		imageFormat: 'jpeg',
	});

	console.log('Done rendering!', outputDir, bucketName);
};
