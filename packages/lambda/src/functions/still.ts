import {InvokeCommand} from '@aws-sdk/client-lambda';
import type {StillImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {estimatePrice} from '../api/estimate-price';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import {getLambdaClient} from '../shared/aws-clients';
import {cleanupSerializedInputProps} from '../shared/cleanup-serialized-input-props';
import type {
	LambdaPayload,
	LambdaPayloads,
	RenderMetadata,
} from '../shared/constants';
import {
	LambdaRoutines,
	MAX_EPHEMERAL_STORAGE_IN_MB,
	renderMetadataKey,
} from '../shared/constants';
import {convertToServeUrl} from '../shared/convert-to-serve-url';
import {deserializeInputProps} from '../shared/deserialize-input-props';
import {getServeUrlHash} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {validateDownloadBehavior} from '../shared/validate-download-behavior';
import {validateOutname} from '../shared/validate-outname';
import {validatePrivacy} from '../shared/validate-privacy';
import {
	getCredentialsFromOutName,
	getExpectedOutName,
} from './helpers/expected-out-name';
import {formatCostsInfo} from './helpers/format-costs-info';
import {getBrowserInstance} from './helpers/get-browser-instance';
import {executablePath} from './helpers/get-chromium-executable-path';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {getOutputUrlFromMetadata} from './helpers/get-output-url-from-metadata';
import {lambdaWriteFile} from './helpers/io';
import {validateComposition} from './helpers/validate-composition';
import {
	getTmpDirStateIfENoSp,
	writeLambdaError,
} from './helpers/write-lambda-error';

type Options = {
	expectedBucketOwner: string;
};

const innerStillHandler = async (
	lambdaParams: LambdaPayload,
	renderId: string,
	options: Options
) => {
	if (lambdaParams.type !== LambdaRoutines.still) {
		throw new TypeError('Expected still type');
	}

	if (lambdaParams.version !== VERSION) {
		if (!lambdaParams.version) {
			throw new Error(
				`Version mismatch: When calling renderStillOnLambda(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call renderStillOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`
			);
		}

		throw new Error(
			`Version mismatch: When calling renderStillOnLambda(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${lambdaParams.version}. Deploy a new function and use it to call renderStillOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`
		);
	}

	validateDownloadBehavior(lambdaParams.downloadBehavior);
	validatePrivacy(lambdaParams.privacy, true);
	validateOutname(lambdaParams.outName, null, null);

	const start = Date.now();

	const [bucketName, browserInstance] = await Promise.all([
		lambdaParams.bucketName ??
			getOrCreateBucket({
				region: getCurrentRegionInFunction(),
			}).then((b) => b.bucketName),
		getBrowserInstance(
			RenderInternals.isEqualOrBelowLogLevel(lambdaParams.logLevel, 'verbose'),
			lambdaParams.chromiumOptions ?? {}
		),
	]);

	const outputDir = RenderInternals.tmpDir('remotion-render-');

	const outputPath = path.join(outputDir, 'output');

	const region = getCurrentRegionInFunction();
	const inputProps = await deserializeInputProps({
		bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region,
		serialized: lambdaParams.inputProps,
	});

	const serveUrl = convertToServeUrl({
		urlOrId: lambdaParams.serveUrl,
		region,
		bucketName,
	});

	const verbose = RenderInternals.isEqualOrBelowLogLevel(
		lambdaParams.logLevel,
		'verbose'
	);

	const server = await RenderInternals.prepareServer({
		concurrency: 1,
		indent: false,
		port: null,
		remotionRoot: process.cwd(),
		verbose,
		webpackConfigOrServeUrl: serveUrl,
	});

	const composition = await validateComposition({
		serveUrl,
		browserInstance,
		composition: lambdaParams.composition,
		inputProps,
		envVariables: lambdaParams.envVariables ?? {},
		chromiumOptions: lambdaParams.chromiumOptions,
		timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
		port: null,
		forceHeight: lambdaParams.forceHeight,
		forceWidth: lambdaParams.forceWidth,
		logLevel: lambdaParams.logLevel,
		server,
	});

	const renderMetadata: RenderMetadata = {
		startedDate: Date.now(),
		videoConfig: composition,
		codec: null,
		compositionId: lambdaParams.composition,
		estimatedTotalLambdaInvokations: 1,
		estimatedRenderLambdaInvokations: 1,
		siteId: getServeUrlHash(serveUrl),
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
		everyNthFrame: 1,
		frameRange: [lambdaParams.frame, lambdaParams.frame],
		audioCodec: null,
	};

	await lambdaWriteFile({
		bucketName,
		key: renderMetadataKey(renderId),
		body: JSON.stringify(renderMetadata),
		region: getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
	});
	await RenderInternals.internalRenderStill({
		composition,
		output: outputPath,
		serveUrl,
		dumpBrowserLogs: lambdaParams.dumpBrowserLogs ?? verbose,
		envVariables: lambdaParams.envVariables ?? {},
		frame: RenderInternals.convertToPositiveFrameIndex({
			frame: lambdaParams.frame,
			durationInFrames: composition.durationInFrames,
		}),
		imageFormat: lambdaParams.imageFormat as StillImageFormat,
		inputProps,
		overwrite: false,
		puppeteerInstance: browserInstance,
		jpegQuality:
			lambdaParams.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		chromiumOptions: lambdaParams.chromiumOptions,
		scale: lambdaParams.scale,
		timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
		browserExecutable: executablePath(),
		cancelSignal: null,
		indent: false,
		onBrowserLog: null,
		onDownload: null,
		port: null,
		server,
		verbose,
	});

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		renderMetadata,
		bucketName,
		getCredentialsFromOutName(lambdaParams.outName)
	);

	const {size} = await fs.promises.stat(outputPath);

	await lambdaWriteFile({
		bucketName: renderBucketName,
		key,
		privacy: lambdaParams.privacy,
		body: fs.createReadStream(outputPath),
		expectedBucketOwner: options.expectedBucketOwner,
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
		durationInMiliseconds: Date.now() - start + 100,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		lambdasInvoked: 1,
		// We cannot determine the ephemeral storage size, so we
		// overestimate the price, but will only have a miniscule effect (~0.2%)
		diskSizeInMb: MAX_EPHEMERAL_STORAGE_IN_MB,
	});

	return {
		output: getOutputUrlFromMetadata(
			renderMetadata,
			bucketName,
			customCredentials
		),
		size,
		bucketName,
		estimatedPrice: formatCostsInfo(estimatedPrice),
		renderId,
	};
};

export const stillHandler = async (
	params: LambdaPayload,
	options: Options
): Promise<ReturnType<typeof innerStillHandler>> => {
	if (params.type !== LambdaRoutines.still) {
		throw new Error('Params must be renderer');
	}

	const renderId = randomHash({randomInTests: true});

	try {
		return innerStillHandler(params, renderId, options);
	} catch (err) {
		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isBrowserError =
			(err as Error).message.includes('FATAL:zygote_communication_linux.cc') ||
			(err as Error).message.includes(
				'error while loading shared libraries: libnss3.so'
			);
		const willRetry = isBrowserError || params.maxRetries > 0;
		if (willRetry) {
			const retryPayload: LambdaPayloads[LambdaRoutines.still] = {
				...params,
				maxRetries: params.maxRetries - 1,
				attempt: params.attempt + 1,
			};
			const res = await getLambdaClient(getCurrentRegionInFunction()).send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(retryPayload),
				})
			);
			const bucketName =
				params.bucketName ??
				(
					await getOrCreateBucket({
						region: getCurrentRegionInFunction(),
					})
				).bucketName;

			// `await` elided on purpose here; using `void` to mark it as intentional
			// eslint-disable-next-line no-void
			void writeLambdaError({
				bucketName,
				errorInfo: {
					chunk: null,
					frame: null,
					isFatal: false,
					name: (err as Error).name,
					message: (err as Error).message,
					stack: (err as Error).stack as string,
					type: 'browser',
					tmpDir: getTmpDirStateIfENoSp((err as Error).stack as string),
					attempt: params.attempt,
					totalAttempts: params.attempt + params.maxRetries,
					willRetry,
				},
				expectedBucketOwner: options.expectedBucketOwner,
				renderId,
			});
			const str = JSON.parse(
				Buffer.from(res.Payload as Uint8Array).toString()
			) as ReturnType<typeof innerStillHandler>;

			return str;
		}

		throw err;
	}
};
