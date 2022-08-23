import {InvokeCommand} from '@aws-sdk/client-lambda';
import type {StillImageFormat} from '@remotion/renderer';
import {RenderInternals, renderStill} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {VERSION} from 'remotion/version';
import {estimatePrice} from '../api/estimate-price';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import {getLambdaClient} from '../shared/aws-clients';
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
import {getServeUrlHash} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {validateDownloadBehavior} from '../shared/validate-download-behavior';
import {validateOutname} from '../shared/validate-outname';
import {validatePrivacy} from '../shared/validate-privacy';
import {getExpectedOutName} from './helpers/expected-out-name';
import {formatCostsInfo} from './helpers/format-costs-info';
import {getBrowserInstance} from './helpers/get-browser-instance';
import {getCurrentArchitecture} from './helpers/get-current-architecture';
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
				`Version mismatch: When calling renderStillOnLambda(), the deployed Lambda function had version ${VERSION} but the @remotion/lambda package is an older version. Align the versions.`
			);
		}

		throw new Error(
			`Version mismatch: When calling renderStillOnLambda(), get deployed Lambda function had version ${VERSION} and the @remotion/lambda package has version ${lambdaParams.version}. Align the versions.`
		);
	}

	validateDownloadBehavior(lambdaParams.downloadBehavior);
	validatePrivacy(lambdaParams.privacy);
	validateOutname(lambdaParams.outName);

	const start = Date.now();

	const [{bucketName}, browserInstance] = await Promise.all([
		getOrCreateBucket({
			region: getCurrentRegionInFunction(),
		}),
		getBrowserInstance(
			RenderInternals.isEqualOrBelowLogLevel(lambdaParams.logLevel, 'verbose'),
			lambdaParams.chromiumOptions ?? {}
		),
	]);
	const outputDir = RenderInternals.tmpDir('remotion-render-');

	const outputPath = path.join(outputDir, 'output');

	const downloadMap = RenderInternals.makeDownloadMap();

	const composition = await validateComposition({
		serveUrl: lambdaParams.serveUrl,
		browserInstance,
		composition: lambdaParams.composition,
		inputProps: lambdaParams.inputProps,
		envVariables: lambdaParams.envVariables,
		ffmpegExecutable: null,
		ffprobeExecutable: null,
		chromiumOptions: lambdaParams.chromiumOptions,
		timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
		port: null,
		downloadMap,
	});

	const renderMetadata: RenderMetadata = {
		startedDate: Date.now(),
		videoConfig: composition,
		codec: null,
		compositionId: lambdaParams.composition,
		estimatedTotalLambdaInvokations: 1,
		estimatedRenderLambdaInvokations: 1,
		siteId: getServeUrlHash(lambdaParams.serveUrl),
		totalChunks: 1,
		type: 'still',
		usesOptimizationProfile: false,
		imageFormat: lambdaParams.imageFormat,
		inputProps: lambdaParams.inputProps,
		lambdaVersion: VERSION,
		framesPerLambda: 1,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		renderId,
		outName: lambdaParams.outName ?? undefined,
	};

	await lambdaWriteFile({
		bucketName,
		key: renderMetadataKey(renderId),
		body: JSON.stringify(renderMetadata),
		region: getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: null,
	});

	await renderStill({
		composition,
		output: outputPath,
		serveUrl: lambdaParams.serveUrl,
		dumpBrowserLogs: false,
		envVariables: lambdaParams.envVariables,
		frame: lambdaParams.frame,
		imageFormat: lambdaParams.imageFormat as StillImageFormat,
		inputProps: lambdaParams.inputProps,
		overwrite: false,
		puppeteerInstance: browserInstance,
		quality: lambdaParams.quality,
		chromiumOptions: lambdaParams.chromiumOptions,
		scale: lambdaParams.scale,
		timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
		downloadMap,
	});

	const {key, renderBucketName} = getExpectedOutName(
		renderMetadata,
		bucketName
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
	});
	await fs.promises.rm(outputPath, {recursive: true});

	const estimatedPrice = estimatePrice({
		durationInMiliseconds: Date.now() - start + 100,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		lambdasInvoked: 1,
		architecture: getCurrentArchitecture(),
		// We cannot determine the ephemeral storage size, so we
		// overestimate the price, but will only have a miniscule effect (~0.2%)
		diskSizeInMb: MAX_EPHEMERAL_STORAGE_IN_MB,
	});

	return {
		output: getOutputUrlFromMetadata(renderMetadata, bucketName),
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
			const {bucketName} = await getOrCreateBucket({
				region: getCurrentRegionInFunction(),
			});

			writeLambdaError({
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
