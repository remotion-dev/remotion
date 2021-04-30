import {InvokeCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {
	CreateBucketCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import {
	getCompositions,
	renderFrames,
	RenderInternals,
	stitchFramesToVideo,
} from '@remotion/renderer';
import fs, {copyFileSync, writeFileSync} from 'fs';
import path from 'path';
import {concatVideos} from '../src/concat-videos';
import {
	EFS_MOUNT_PATH,
	LambdaPayload,
	REGION,
	RENDERS_BUCKET_PREFIX,
} from '../src/constants';
import {timer} from '../src/timer';
import {executablePath} from './get-chromium-executable-path';

const s3Client = new S3Client({region: REGION});
const lambdaClient = new LambdaClient({region: REGION});

type Await<T> = T extends PromiseLike<infer U> ? U : T;

let _browserInstance: Await<
	ReturnType<typeof RenderInternals.openBrowser>
> | null;

// TODO Potential race condition
const getBrowserInstance = async () => {
	if (_browserInstance) {
		return _browserInstance;
	}
	const execPath = await executablePath();
	_browserInstance = await RenderInternals.openBrowser('chrome', {
		customExecutable: execPath,
	});
	return _browserInstance;
};

const validateComposition = async ({
	serveUrl,
	composition,
	browserInstance,
}: {
	serveUrl: string;
	composition: string;
	browserInstance: Await<ReturnType<typeof RenderInternals.openBrowser>>;
}) => {
	// TODO: Support input props
	const compositions = await getCompositions({
		serveUrl,
		browserInstance,
	});
	const found = compositions.find((c) => c.id === composition);
	if (!found) {
		throw new Error(
			`No composition with ID ${composition} found. Available compositions: ${compositions
				.map((c) => c.id)
				.join(', ')}`
		);
	}
	return found;
};

export const handler = async (params: LambdaPayload) => {
	console.log('CONTEXT', params);
	const outputDir = '/tmp/' + 'remotion-render-' + Math.random();
	const efsRemotionVideoRenderDone = EFS_MOUNT_PATH + '/render-done';
	if (fs.existsSync(outputDir)) {
		fs.rmdirSync(outputDir);
	}
	fs.mkdirSync(outputDir);

	const browserInstance = await getBrowserInstance();

	if (params.type === 'init') {
		const bucketName = RENDERS_BUCKET_PREFIX + Math.random();
		const efsRemotionVideoPath = EFS_MOUNT_PATH + '/remotion-video';
		if (fs.existsSync(efsRemotionVideoPath)) {
			fs.rmdirSync(efsRemotionVideoPath, {recursive: true});
		}
		fs.mkdirSync(efsRemotionVideoPath);
		if (fs.existsSync(efsRemotionVideoRenderDone)) {
			fs.rmdirSync(efsRemotionVideoRenderDone, {recursive: true});
		}
		fs.mkdirSync(efsRemotionVideoRenderDone);
		// const bucketTimer = timer('Creating bucket');

		// TODO: Better validation
		if (!params.chunkSize) {
			throw new Error('Pass chunkSize');
		}
		// TODO: Better validation
		if (!params.durationInFrames) {
			throw new Error('Pass durationInFrames');
		}

		const comp = await validateComposition({
			serveUrl: params.serveUrl,
			composition: params.composition,
			browserInstance,
		});
		console.log(comp);
		const bucketTimer = timer('creating bucket');
		await s3Client.send(
			new CreateBucketCommand({
				Bucket: bucketName,
				ACL: 'public-read',
			})
		);
		bucketTimer.end();
		const {chunkSize} = params;
		const chunkCount = Math.ceil(params.durationInFrames / chunkSize);

		const chunks = new Array(chunkCount).fill(1).map((_, i) => {
			return [
				i * chunkSize,
				Math.min(params.durationInFrames, (i + 1) * chunkSize) - 1,
			] as [number, number];
		});
		const reqSend = timer('sending off requests');
		await Promise.all(
			chunks.map(async (chunk) => {
				const payload: LambdaPayload = {
					type: 'renderer',
					frameRange: chunk,
					serveUrl: params.serveUrl,
					chunk: chunks.indexOf(chunk),
					efsRemotionVideoPath,
					composition: params.composition,
					fps: comp.fps,
					height: comp.height,
					width: comp.width,
					durationInFrames: params.durationInFrames,
				};
				const callingLambdaTimer = timer(
					'Calling lambda ' + chunks.indexOf(chunk)
				);
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
		reqSend.end();
		const out = await concatVideos(
			efsRemotionVideoPath,
			efsRemotionVideoRenderDone,
			chunkCount
		);
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
		if (!fs.existsSync(params.efsRemotionVideoPath)) {
			fs.mkdirSync(params.efsRemotionVideoPath);
		}
		if (!fs.existsSync(efsRemotionVideoRenderDone)) {
			fs.mkdirSync(efsRemotionVideoRenderDone);
		}
		console.log(
			`Started rendering ${params.chunk}, frame ${params.frameRange}`
		);
		await renderFrames({
			compositionId: params.composition,
			config: {
				durationInFrames: params.durationInFrames,
				fps: params.fps,
				height: params.height,
				width: params.width,
			},
			imageFormat: 'jpeg',
			inputProps: {},
			frameRange: params.frameRange,
			onFrameUpdate: (i: number, output: string) => {
				console.log('Rendered frames', i, output);
			},
			parallelism: 2,
			onStart: () => {
				console.log('Starting');
			},
			outputDir,
			puppeteerInstance: browserInstance,
			serveUrl: params.serveUrl,
		});
		const outdir = `/tmp/${Math.random()}`;
		fs.mkdirSync(outdir);

		const outputLocation = path.join(
			params.efsRemotionVideoPath,
			`chunk-${String(params.chunk).padStart(8, '0')}.mp4`
		);
		const intermediary = path.join(
			outdir,
			`chunk-${String(params.chunk).padStart(8, '0')}.mp4`
		);
		const outputFileLocation = path.join(
			efsRemotionVideoRenderDone,
			`chunk-${String(params.chunk).padStart(8, '0')}.txt`
		);
		console.log(outputLocation);

		const stitchLabel = timer('stitcher');
		await stitchFramesToVideo({
			assetsInfo: {
				// TODO
				assets: [],
				bundleDir: '',
			},
			dir: outputDir,
			force: true,
			fps: params.fps,
			height: params.height,
			width: params.width,
			outputLocation: intermediary,
			// TODO
			codec: 'h264',
			// TODO
			imageFormat: 'jpeg',
		});
		stitchLabel.end();
		const copying = timer('copying');
		copyFileSync(intermediary, outputLocation);
		copying.end();

		const flag = timer('writing flag');
		writeFileSync(outputFileLocation, 'true');
		flag.end();
		console.log('Done rendering!', outputDir, outputLocation);
	} else {
		throw new Error('Command not found');
	}
};
