import {InvokeCommand} from '@aws-sdk/client-lambda';
import {Log} from '@remotion/cli/dist/log';
import {renderFrames, stitchFramesToVideo} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {getLambdaClient} from '../shared/aws-clients';
import {
	chunkKey,
	lambdaInitializedKey,
	LambdaPayload,
	LambdaPayloads,
	LambdaRoutines,
	lambdaTimingsKey,
} from '../shared/constants';
import {getFileExtensionFromCodec} from '../shared/get-file-extension-from-codec';
import {randomHash} from '../shared/random-hash';
import {tmpDir} from '../shared/tmpdir';
import {
	ChunkTimingData,
	ObjectChunkTimingData,
} from './chunk-optimization/types';
import {deletedFiles} from './helpers/clean-tmpdir';
import {closeBrowser, getBrowserInstance} from './helpers/get-browser-instance';
import {getCurrentRegion} from './helpers/get-current-region';
import {lambdaWriteFile} from './helpers/io';
import {timer} from './helpers/timer';
import {writeLambdaError} from './helpers/write-lambda-error';

type Options = {
	expectedBucketOwner: string;
	isWarm: boolean;
};

const renderHandler = async (params: LambdaPayload, options: Options) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	const browserInstance = await getBrowserInstance();
	const outputPath = '/tmp/remotion-render-' + randomHash();
	if (fs.existsSync(outputPath)) {
		(fs.rmSync ?? fs.rmdirSync)(outputPath);
	}

	fs.mkdirSync(outputPath);

	if (typeof params.chunk !== 'number') {
		throw new Error('must pass chunk');
	}

	if (!params.frameRange) {
		throw new Error('must pass framerange');
	}

	const start = Date.now();
	const chunkTimingData: ObjectChunkTimingData = {
		timings: {},
		chunk: params.chunk,
		frameRange: params.frameRange,
		startDate: start,
	};
	const {assetsInfo} = await renderFrames({
		compositionId: params.composition,
		config: {
			durationInFrames: params.durationInFrames,
			fps: params.fps,
			height: params.height,
			width: params.width,
		},
		imageFormat: params.imageFormat,
		inputProps: params.inputProps,
		frameRange: params.frameRange,
		onFrameUpdate: (i: number, output: string, frameNumber: number) => {
			chunkTimingData.timings[frameNumber] = Date.now() - start;
		},
		parallelism: 1,
		onStart: () => {
			lambdaWriteFile({
				acl: 'private',
				bucketName: params.bucketName,
				body: JSON.stringify({
					filesInTmp: fs.readdirSync('/tmp'),
					isWarm: options.isWarm,
					deletedFiles,
				}),
				key: `${lambdaInitializedKey(params.renderId)}-${params.chunk}.txt`,
				region: getCurrentRegion(),
				expectedBucketOwner: options.expectedBucketOwner,
			});
		},
		outputDir: outputPath,
		puppeteerInstance: browserInstance,
		serveUrl: params.serveUrl,
		quality: params.quality,
		envVariables: params.envVariables,
		onError: ({error, frame}) => {
			writeLambdaError({
				errorInfo: {
					stack: error.stack as string,
					type: 'browser',
					frame,
					chunk: params.chunk,
					isFatal: false,
				},
				bucketName: params.bucketName,
				expectedBucketOwner: options.expectedBucketOwner,
				renderId: params.renderId,
			});
		},
		browser: 'chrome',
		dumpBrowserLogs: false,
	});
	const condensedTimingData: ChunkTimingData = {
		...chunkTimingData,
		timings: Object.values(chunkTimingData.timings),
	};
	const uploadMetricsData = lambdaWriteFile({
		bucketName: params.bucketName,
		body: JSON.stringify(condensedTimingData as ChunkTimingData, null, 2),
		key: `${lambdaTimingsKey(params.renderId)}-${params.chunk}.txt`,
		region: getCurrentRegion(),
		acl: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
	});
	const outdir = tmpDir('bucket');

	const outputLocation = path.join(
		outdir,
		`localchunk-${String(params.chunk).padStart(
			8,
			'0'
		)}.${getFileExtensionFromCodec(params.codec, 'chunk')}`
	);

	const stitchLabel = timer('stitcher');
	await stitchFramesToVideo({
		assetsInfo: {
			...assetsInfo,
			// Make all assets remote
			assets: assetsInfo.assets.map((asset) => {
				return asset.map((a) => {
					return {
						...a,
						isRemote: true,
					};
				});
			}),
		},
		downloadDir: '/tmp',
		dir: outputPath,
		force: true,
		fps: params.fps,
		height: params.height,
		width: params.width,
		outputLocation,
		codec: params.codec,
		imageFormat: params.imageFormat,
		crf: params.crf,
		pixelFormat: params.pixelFormat,
		proResProfile: params.proResProfile,
		parallelism: 1,
		verbose: false,
		onProgress: () => {
			// TODO: upload progress from time to time
		},
		webpackBundle: null,
	});
	stitchLabel.end();

	await Promise.all([
		uploadMetricsData,
		lambdaWriteFile({
			bucketName: params.bucketName,
			key: `${chunkKey(params.renderId)}${String(params.chunk).padStart(
				8,
				'0'
			)}`,
			body: fs.createReadStream(outputLocation),
			region: getCurrentRegion(),
			acl: 'public-read',
			expectedBucketOwner: options.expectedBucketOwner,
		}),
	]);
	await Promise.all([
		fs.promises.rm(outputLocation, {recursive: true}),
		fs.promises.rm(outputPath, {recursive: true}),
	]);
};

export const rendererHandler = async (
	params: LambdaPayload,
	options: Options
) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	try {
		await renderHandler(params, options);
	} catch (err) {
		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isBrowserError =
			err.message.includes('FATAL:zygote_communication_linux.cc') ||
			err.message.included('error while loading shared libraries: libnss3.so');
		if (isBrowserError || params.retriesLeft > 0) {
			const retryPayload: LambdaPayloads[LambdaRoutines.renderer] = {
				...params,
				retriesLeft: params.retriesLeft - 1,
			};
			await getLambdaClient(getCurrentRegion()).send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(retryPayload),
					InvocationType: 'Event',
				})
			);
		}

		Log.error('Error occurred');
		Log.error(err);
		await writeLambdaError({
			bucketName: params.bucketName,
			errorInfo: {
				stack: err.stack,
				chunk: params.chunk,
				frame: null,
				type: 'renderer',
				isFatal: !isBrowserError,
			},
			renderId: params.renderId,
			expectedBucketOwner: options.expectedBucketOwner,
		});
	} finally {
		await closeBrowser();
	}
};
