import type {StillImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import {VERSION} from 'remotion/version';
import {estimatePrice} from '../api/estimate-price';
import {internalGetOrCreateBucket} from '../api/get-or-create-bucket';
import {callLambda} from '../shared/call-lambda';
import {cleanupSerializedInputProps} from '../shared/cleanup-serialized-input-props';
import {decompressInputProps} from '../shared/compress-props';
import type {
	CostsInfo,
	LambdaPayload,
	LambdaPayloads,
	RenderMetadata,
} from '../shared/constants';
import {
	LambdaRoutines,
	MAX_EPHEMERAL_STORAGE_IN_MB,
	overallProgressKey,
} from '../shared/constants';
import {convertToServeUrl} from '../shared/convert-to-serve-url';
import {isFlakyError} from '../shared/is-flaky-error';
import {validateDownloadBehavior} from '../shared/validate-download-behavior';
import {validateOutname} from '../shared/validate-outname';
import {validatePrivacy} from '../shared/validate-privacy';
import {
	getCredentialsFromOutName,
	getExpectedOutName,
} from './helpers/expected-out-name';
import {formatCostsInfo} from './helpers/format-costs-info';
import {
	forgetBrowserEventLoop,
	getBrowserInstance,
} from './helpers/get-browser-instance';
import {executablePath} from './helpers/get-chromium-executable-path';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {getOutputUrlFromMetadata} from './helpers/get-output-url-from-metadata';
import {lambdaWriteFile} from './helpers/io';
import {onDownloadsHelper} from './helpers/on-downloads-logger';
import {makeInitialOverallRenderProgress} from './helpers/overall-render-progress';
import {validateComposition} from './helpers/validate-composition';
import type {OnStream} from './streaming/streaming';

type Options = {
	params: LambdaPayload;
	renderId: string;
	expectedBucketOwner: string;
	onStream: OnStream | undefined;
};

const innerStillHandler = async ({
	params: lambdaParams,
	expectedBucketOwner,
	renderId,
	onStream,
}: Options) => {
	if (lambdaParams.type !== LambdaRoutines.still) {
		throw new TypeError('Expected still type');
	}

	if (lambdaParams.version !== VERSION) {
		if (!lambdaParams.version) {
			throw new Error(
				`Version mismatch: When calling renderStillOnLambda(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call renderStillOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`,
			);
		}

		throw new Error(
			`Version mismatch: When calling renderStillOnLambda(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${lambdaParams.version}. Deploy a new function and use it to call renderStillOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`,
		);
	}

	validateDownloadBehavior(lambdaParams.downloadBehavior);
	validatePrivacy(lambdaParams.privacy, true);
	validateOutname({
		outName: lambdaParams.outName,
		codec: null,
		audioCodecSetting: null,
		separateAudioTo: null,
	});

	const start = Date.now();

	const browserInstancePromise = getBrowserInstance(
		lambdaParams.logLevel,
		false,
		lambdaParams.chromiumOptions,
	);
	const bucketNamePromise =
		lambdaParams.bucketName ??
		internalGetOrCreateBucket({
			region: getCurrentRegionInFunction(),
			enableFolderExpiry: null,
			customCredentials: null,
		}).then((b) => b.bucketName);

	const outputDir = RenderInternals.tmpDir('remotion-render-');

	const outputPath = path.join(outputDir, 'output');

	const region = getCurrentRegionInFunction();
	const bucketName = await bucketNamePromise;
	const serializedInputPropsWithCustomSchema = await decompressInputProps({
		bucketName,
		expectedBucketOwner,
		region,
		serialized: lambdaParams.inputProps,
		propsType: 'input-props',
	});

	const serveUrl = convertToServeUrl({
		urlOrId: lambdaParams.serveUrl,
		region,
		bucketName,
	});

	const server = await RenderInternals.prepareServer({
		concurrency: 1,
		indent: false,
		port: null,
		remotionRoot: process.cwd(),
		logLevel: lambdaParams.logLevel,
		webpackConfigOrServeUrl: serveUrl,
		offthreadVideoCacheSizeInBytes: lambdaParams.offthreadVideoCacheSizeInBytes,
		binariesDirectory: null,
		forceIPv4: false,
	});

	const browserInstance = await browserInstancePromise;
	const composition = await validateComposition({
		serveUrl,
		browserInstance: browserInstance.instance,
		composition: lambdaParams.composition,
		serializedInputPropsWithCustomSchema,
		envVariables: lambdaParams.envVariables ?? {},
		chromiumOptions: lambdaParams.chromiumOptions,
		timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
		port: null,
		forceHeight: lambdaParams.forceHeight,
		forceWidth: lambdaParams.forceWidth,
		logLevel: lambdaParams.logLevel,
		server,
		offthreadVideoCacheSizeInBytes: lambdaParams.offthreadVideoCacheSizeInBytes,
		onBrowserDownload: () => {
			throw new Error('Should not download a browser in Lambda');
		},
	});

	const renderMetadata: RenderMetadata = {
		startedDate: Date.now(),
		videoConfig: composition,
		codec: null,
		compositionId: lambdaParams.composition,
		estimatedTotalLambdaInvokations: 1,
		estimatedRenderLambdaInvokations: 1,
		siteId: serveUrl,
		totalChunks: 1,
		type: 'still',
		imageFormat: lambdaParams.imageFormat,
		inputProps: lambdaParams.inputProps,
		lambdaVersion: VERSION,
		framesPerLambda: 1,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		renderId,
		outName: lambdaParams.outName ?? undefined,
		privacy: lambdaParams.privacy,
		audioCodec: null,
		deleteAfter: lambdaParams.deleteAfter,
		numberOfGifLoops: null,
		downloadBehavior: lambdaParams.downloadBehavior,
		audioBitrate: null,
	};

	const still = makeInitialOverallRenderProgress();
	still.renderMetadata = renderMetadata;

	await lambdaWriteFile({
		bucketName,
		key: overallProgressKey(renderId),
		body: JSON.stringify(still),
		region: getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
	});

	const onBrowserDownload = () => {
		throw new Error('Should not download a browser in Lambda');
	};

	await RenderInternals.internalRenderStill({
		composition,
		output: outputPath,
		serveUrl,
		envVariables: lambdaParams.envVariables ?? {},
		frame: RenderInternals.convertToPositiveFrameIndex({
			frame: lambdaParams.frame,
			durationInFrames: composition.durationInFrames,
		}),
		imageFormat: lambdaParams.imageFormat as StillImageFormat,
		serializedInputPropsWithCustomSchema,
		overwrite: false,
		puppeteerInstance: browserInstance.instance,
		jpegQuality:
			lambdaParams.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		chromiumOptions: lambdaParams.chromiumOptions,
		scale: lambdaParams.scale,
		timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
		browserExecutable: executablePath(),
		cancelSignal: null,
		indent: false,
		onBrowserLog: null,
		onDownload: onDownloadsHelper(lambdaParams.logLevel),
		port: null,
		server,
		logLevel: lambdaParams.logLevel,
		serializedResolvedPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: composition.props,
			}).serializedString,
		offthreadVideoCacheSizeInBytes: lambdaParams.offthreadVideoCacheSizeInBytes,
		binariesDirectory: null,
		onBrowserDownload,
	});

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		renderMetadata,
		bucketName,
		getCredentialsFromOutName(lambdaParams.outName),
	);

	const {size} = await fs.promises.stat(outputPath);

	await lambdaWriteFile({
		bucketName: renderBucketName,
		key,
		privacy: lambdaParams.privacy,
		body: fs.createReadStream(outputPath),
		expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		downloadBehavior: lambdaParams.downloadBehavior,
		customCredentials,
	});

	await Promise.all([
		fs.promises.rm(outputPath, {recursive: true}),
		cleanupSerializedInputProps({
			bucketName,
			region: getCurrentRegionInFunction(),
			serialized: lambdaParams.inputProps,
		}),
		server.closeServer(true),
	]);

	const estimatedPrice = estimatePrice({
		durationInMilliseconds: Date.now() - start + 100,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		lambdasInvoked: 1,
		// We cannot determine the ephemeral storage size, so we
		// overestimate the price, but will only have a miniscule effect (~0.2%)
		diskSizeInMb: MAX_EPHEMERAL_STORAGE_IN_MB,
	});

	const {key: outKey, url} = getOutputUrlFromMetadata(
		renderMetadata,
		bucketName,
		customCredentials,
	);

	const payload: RenderStillLambdaResponsePayload = {
		type: 'success' as const,
		output: url,
		size,
		sizeInBytes: size,
		bucketName,
		estimatedPrice: formatCostsInfo(estimatedPrice),
		renderId,
		outKey,
	};

	if (onStream) {
		onStream({
			type: 'still-rendered',
			payload,
		});
	} else {
		return payload;
	}
};

export type RenderStillLambdaResponsePayload = {
	type: 'success';
	output: string;
	outKey: string;
	size: number;
	bucketName: string;
	sizeInBytes: number;
	estimatedPrice: CostsInfo;
	renderId: string;
};

export const stillHandler = async (
	options: Options,
): Promise<RenderStillLambdaResponsePayload | null> => {
	const {params} = options;

	if (params.type !== LambdaRoutines.still) {
		throw new Error('Params must be renderer');
	}

	try {
		const res = await innerStillHandler(options);
		return res ?? null;
	} catch (err) {
		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isBrowserError = isFlakyError(err as Error);
		const willRetry = isBrowserError || params.maxRetries > 0;

		if (!willRetry) {
			throw err;
		}

		RenderInternals.Log.error(
			{
				indent: false,
				logLevel: params.logLevel,
			},
			'Got error:',
			(err as Error).stack,
			'Will retry.',
		);

		const retryPayload: LambdaPayloads[LambdaRoutines.still] = {
			...params,
			maxRetries: params.maxRetries - 1,
			attempt: params.attempt + 1,
		};

		const res = await callLambda({
			functionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
			payload: retryPayload,
			region: getCurrentRegionInFunction(),
			type: LambdaRoutines.still,
			timeoutInTest: 120000,
			retriesRemaining: 0,
		});

		return res;
	} finally {
		forgetBrowserEventLoop(
			options.params.type === LambdaRoutines.still
				? options.params.logLevel
				: 'error',
		);
	}
};
