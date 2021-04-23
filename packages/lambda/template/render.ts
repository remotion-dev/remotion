import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {
	CreateBucketCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import {
	openBrowser,
	renderFrames,
	stitchFramesToVideo,
} from '@remotion/renderer';
import fs, {unlinkSync} from 'fs';
import path from 'path';
import {concatVideos} from '../src/concat-videos';
import {LambdaPayload, REGION, RENDERS_BUCKET_PREFIX} from '../src/constants';
import {timer} from '../src/timer';
import {executablePath} from './get-chromium-executable-path';

const s3Client = new S3Client({region: REGION});
const lambdaClient = new LambdaClient({region: REGION});

type Await<T> = T extends PromiseLike<infer U> ? U : T;

let browserInstance: Await<ReturnType<typeof openBrowser>> | null;

const getBrowserInstance = async () => {
	if (browserInstance) {
		return browserInstance;
	}
	const execPath = await executablePath();
	browserInstance = await openBrowser('chrome', {
		customExecutable: execPath,
	});
	return browserInstance;
};

const chunkCount = 300;
const chunkSize = 20;
const totalFrames = chunkCount * chunkSize;

export const handler = async (params: LambdaPayload) => {
	console.log('CONTEXT', params);
	const outputDir = '/tmp/' + 'remotion-render-' + Math.random();
	if (fs.existsSync(outputDir)) {
		fs.rmdirSync(outputDir);
	}
	fs.mkdirSync(outputDir);

	if (params.type === 'init') {
		const bucketName = RENDERS_BUCKET_PREFIX + Math.random();
		const bucketTimer = timer('Creating bucket');
		await s3Client.send(
			new CreateBucketCommand({
				Bucket: bucketName,
				ACL: 'public-read',
			})
		);
		bucketTimer.end();
		const chunks = new Array(chunkCount).fill(1).map((_, i) => {
			return [i * chunkSize, (i + 1) * chunkSize - 1] as [number, number];
		});
		await Promise.all(
			chunks.map(async (chunk) => {
				const payload: LambdaPayload = {
					type: 'renderer',
					frameRange: chunk,
					serveUrl: params.serveUrl,
					chunk: chunks.indexOf(chunk),
					bucketName,
				};
				const callingLambdaTimer = timer('Calling lambda');
				await lambdaClient.send(
					new InvokeCommand({
						FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
						// @ts-expect-error
						Payload: JSON.stringify(payload),
						InvocationType: 'Event',
					})
				);
				callingLambdaTimer.end();
			})
		);
		const out = await concatVideos(s3Client, bucketName, chunkCount);
		const outName = 'out.mp4';
		await s3Client.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Key: 'out.mp4',
				Body: fs.createReadStream(out),
				ACL: 'public-read',
			})
		);
		console.log(
			'Done! ' + `https://s3.${REGION}.amazonaws.com/${bucketName}/${outName}`
		);
	} else if (params.type === 'renderer') {
		if (typeof params.chunk !== 'number') {
			throw new Error('must pass chunk');
		}
		if (!params.frameRange) {
			throw new Error('must pass framerange');
		}

		const instance = await getBrowserInstance();
		await renderFrames({
			compositionId: 'my-video',
			config: {
				durationInFrames: totalFrames,
				fps: 30,
				height: 1080,
				width: 1920,
			},
			imageFormat: 'jpeg',
			inputProps: {},
			frameRange: params.frameRange,
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
		fs.mkdirSync(outdir);

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
			width: 1920,
			outputLocation,
			// TODO
			codec: 'h264',
			// TODO
			imageFormat: 'jpeg',
		});
		await s3Client.send(
			new PutObjectCommand({
				Bucket: params.bucketName,
				Key: `chunk-${String(params.chunk).padStart(8, '0')}.mp4`,
				Body: fs.createReadStream(outputLocation),
			})
		);
		unlinkSync(outputLocation);
		console.log('Done rendering!', outputDir, params.bucketName);
	} else {
		throw new Error('Command not found');
	}
};
