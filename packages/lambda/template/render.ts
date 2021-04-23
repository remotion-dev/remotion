import {
	CreateBucketCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import {openBrowser, renderFrames} from '@remotion/renderer';
import fs, {createReadStream} from 'fs';
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
	browserInstance = await openBrowser('chrome', {
		customExecutable: await executablePath(),
	});
	return browserInstance;
};

export const handler = async (params: {serveUrl: string}) => {
	console.log('CONTEXT', params);
	const outputDir = '/tmp/' + 'remotion-render-' + Math.random();
	fs.mkdirSync(outputDir);
	const bucketName = RENDERS_BUCKET_PREFIX + Math.random();
	let framesUploaded = 0;

	await s3Client.send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);
	const totalFrames = 20;
	const instance = await getBrowserInstance();
	await new Promise<void>((resolve) => {
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
				const start = Date.now();
				s3Client
					.send(
						new PutObjectCommand({
							Bucket: bucketName,
							Body: createReadStream(output),
							Key: path.basename(output),
							ACL: 'public-read',
						})
					)
					.then(() => {
						framesUploaded++;
						console.log('Uploaded frame in ' + (Date.now() - start) + 'ms');
						if (framesUploaded === totalFrames) {
							resolve();
						}
					})
					.catch((err) => {
						console.log(err);
						// TODO: Need to cancel serverless function
					});
			},
			onStart: () => {
				console.log('Starting');
			},
			outputDir,
			puppeteerInstance: instance,
			serveUrl: params.serveUrl,
		});
	});

	console.log('Done rendering!', outputDir, bucketName);
};
