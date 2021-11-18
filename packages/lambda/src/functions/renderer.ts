import {InvokeCommand} from '@aws-sdk/client-lambda';
import {RenderInternals, renderMedia} from '@remotion/renderer';
import {BrowserLog} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {getLambdaClient} from '../shared/aws-clients';
import {
	chunkKeyForIndex,
	lambdaInitializedKey,
	LambdaPayload,
	LambdaPayloads,
	LambdaRoutines,
	lambdaTimingsKey,
	OUTPUT_PATH_PREFIX,
	RENDERER_PATH_TOKEN,
} from '../shared/constants';
import {randomHash} from '../shared/random-hash';
import {
	ChunkTimingData,
	ObjectChunkTimingData,
} from './chunk-optimization/types';
import {deletedFiles, deletedFilesSize} from './helpers/clean-tmpdir';
import {getBrowserInstance} from './helpers/get-browser-instance';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {getFolderFiles} from './helpers/get-files-in-folder';
import {getFolderSizeRecursively} from './helpers/get-folder-size';
import {lambdaWriteFile} from './helpers/io';
import {uploadBrowserLogs} from './helpers/upload-browser-logs';
import {
	getTmpDirStateIfENoSp,
	writeLambdaError,
} from './helpers/write-lambda-error';

type Options = {
	expectedBucketOwner: string;
	isWarm: boolean;
};

const renderHandler = async (
	params: LambdaPayload,
	options: Options,
	logs: BrowserLog[]
) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	const browserInstance = await getBrowserInstance(params.saveBrowserLogs);
	const outputPath = OUTPUT_PATH_PREFIX + randomHash();
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

	const outdir = RenderInternals.tmpDir(RENDERER_PATH_TOKEN);

	const outputLocation = path.join(
		outdir,
		`localchunk-${String(params.chunk).padStart(
			8,
			'0'
		)}.${RenderInternals.getFileExtensionFromCodec(params.codec, 'chunk')}`
	);

	await renderMedia({
		config: {
			id: params.composition,
			durationInFrames: params.durationInFrames,
			fps: params.fps,
			height: params.height,
			width: params.width,
		},
		imageFormat: params.imageFormat,
		inputProps: params.inputProps,
		frameRange: params.frameRange,
		onProgress: ({renderedFrames}) => {
			chunkTimingData.timings[renderedFrames] = Date.now() - start;
		},
		parallelism: 1,
		onStart: () => {
			lambdaWriteFile({
				privacy: 'private',
				bucketName: params.bucketName,
				body: JSON.stringify({
					filesCleaned: deletedFilesSize,
					filesInTmp: fs.readdirSync('/tmp'),
					isWarm: options.isWarm,
					deletedFiles,
					tmpSize: getFolderSizeRecursively('/tmp'),
					tmpDirFiles: getFolderFiles('/tmp'),
				}),
				key: lambdaInitializedKey({
					renderId: params.renderId,
					chunk: params.chunk,
					attempt: params.attempt,
				}),
				region: getCurrentRegionInFunction(),
				expectedBucketOwner: options.expectedBucketOwner,
			});
		},
		openedBrowser: browserInstance,
		serveUrl: params.serveUrl,
		quality: params.quality,
		envVariables: params.envVariables,
		browser: 'chrome',
		dumpBrowserLogs: params.saveBrowserLogs,
		onBrowserLog: (log) => {
			logs.push(log);
		},
		absoluteOutputFile: outputLocation,
		codec: params.codec,
		crf: params.crf ?? null,
		ffmpegExecutable: null,
		pixelFormat: params.pixelFormat,
		proResProfile: params.proResProfile,
		onDownload: (src: string) => {
			console.log('Downloading', src);
			return () => undefined;
		},

		overwrite: false,
	});

	const endRendered = Date.now();

	await RenderInternals.addSilentAudioIfNecessary(outputLocation);

	const condensedTimingData: ChunkTimingData = {
		...chunkTimingData,
		timings: Object.values(chunkTimingData.timings),
	};

	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: chunkKeyForIndex({
			renderId: params.renderId,
			index: params.chunk,
		}),
		body: fs.createReadStream(outputLocation),
		region: getCurrentRegionInFunction(),
		privacy: params.privacy,
		expectedBucketOwner: options.expectedBucketOwner,
	});
	await Promise.all([
		fs.promises.rm(outputLocation, {recursive: true}),
		fs.promises.rm(outputPath, {recursive: true}),
		lambdaWriteFile({
			bucketName: params.bucketName,
			body: JSON.stringify(condensedTimingData as ChunkTimingData, null, 2),
			key: `${lambdaTimingsKey({
				renderId: params.renderId,
				chunk: params.chunk,
				rendered: endRendered,
				start,
			})}`,
			region: getCurrentRegionInFunction(),
			privacy: 'private',
			expectedBucketOwner: options.expectedBucketOwner,
		}),
	]);
};

export const rendererHandler = async (
	params: LambdaPayload,
	options: Options
) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	const logs: BrowserLog[] = [];

	try {
		await renderHandler(params, options, logs);
	} catch (err) {
		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isBrowserError =
			(err as Error).message.includes('FATAL:zygote_communication_linux.cc') ||
			(err as Error).message.includes(
				'error while loading shared libraries: libnss3.so'
			);
		const willRetry = isBrowserError || params.retriesLeft > 0;

		console.log('Error occurred');
		console.log(err);
		await writeLambdaError({
			bucketName: params.bucketName,
			errorInfo: {
				stack: (err as Error).stack as string,
				chunk: params.chunk,
				frame: null,
				type: 'renderer',
				isFatal: !isBrowserError,
				tmpDir: getTmpDirStateIfENoSp((err as Error).stack as string),
				attempt: params.attempt,
				totalAttempts: params.retriesLeft + params.attempt,
				willRetry,
			},
			renderId: params.renderId,
			expectedBucketOwner: options.expectedBucketOwner,
		});
		if (willRetry) {
			const retryPayload: LambdaPayloads[LambdaRoutines.renderer] = {
				...params,
				retriesLeft: params.retriesLeft - 1,
				attempt: params.attempt + 1,
			};
			await getLambdaClient(getCurrentRegionInFunction()).send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(retryPayload),
					InvocationType: 'Event',
				})
			);
		}
	} finally {
		if (params.saveBrowserLogs) {
			await uploadBrowserLogs({
				chunk: params.chunk,
				bucketName: params.bucketName,
				endFrame: params.frameRange[1],
				startFrame: params.frameRange[0],
				expectedBucketOwner: options.expectedBucketOwner,
				logs,
				renderId: params.renderId,
			});
		}
	}
};
