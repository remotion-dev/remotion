import {InvokeCommand} from '@aws-sdk/client-lambda';
import {renderStill} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {StillImageFormat} from 'remotion';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import {estimatePrice} from '../pricing/calculate-price';
import {getLambdaClient} from '../shared/aws-clients';
import {
	CURRENT_VERSION,
	LambdaPayload,
	LambdaPayloads,
	LambdaRoutines,
	OUTPUT_PATH_PREFIX,
	outStillName,
	RenderMetadata,
	renderMetadataKey,
} from '../shared/constants';
import {getServeUrlHash} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {validatePrivacy} from '../shared/validate-privacy';
import {formatCostsInfo} from './helpers/format-costs-info';
import {getBrowserInstance} from './helpers/get-browser-instance';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
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

	validatePrivacy(lambdaParams.privacy);

	const start = Date.now();

	const [{bucketName}, browserInstance] = await Promise.all([
		getOrCreateBucket({
			region: getCurrentRegionInFunction(),
		}),
		getBrowserInstance(lambdaParams.saveBrowserLogs ?? false),
	]);
	const outputDir = OUTPUT_PATH_PREFIX + randomHash();

	if (fs.existsSync(outputDir)) {
		(fs.rmSync ?? fs.rmdirSync)(outputDir);
	}

	fs.mkdirSync(outputDir);

	const outputPath = path.join(outputDir, 'output');

	const composition = await validateComposition({
		serveUrl: lambdaParams.serveUrl,
		browserInstance,
		composition: lambdaParams.composition,
		inputProps: lambdaParams.inputProps,
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
		lambdaVersion: CURRENT_VERSION,
		framesPerLambda: 1,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		renderId,
	};

	await lambdaWriteFile({
		bucketName,
		key: renderMetadataKey(renderId),
		body: JSON.stringify(renderMetadata),
		region: getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
	});

	await renderStill({
		composition,
		output: outputPath,
		serveUrl: lambdaParams.serveUrl,
		browser: 'chrome',
		dumpBrowserLogs: false,
		envVariables: lambdaParams.envVariables,
		frame: lambdaParams.frame,
		imageFormat: lambdaParams.imageFormat as StillImageFormat,
		inputProps: lambdaParams.inputProps,
		overwrite: false,
		puppeteerInstance: browserInstance,
		quality: lambdaParams.quality,
	});

	const outName = outStillName(renderId, lambdaParams.imageFormat);

	const {size} = await fs.promises.stat(outputPath);

	await lambdaWriteFile({
		bucketName,
		key: outName,
		privacy: lambdaParams.privacy,
		body: fs.createReadStream(outputPath),
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
	});
	await fs.promises.rm(outputPath, {recursive: true});

	const estimatedPrice = estimatePrice({
		durationInMiliseconds: Date.now() - start + 100,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
	});

	return {
		output: `https://s3.${getCurrentRegionInFunction()}.amazonaws.com/${bucketName}/${outName}`,
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

	const renderId = randomHash();

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
			// TODO: Test retries by failing sometimes
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
					stack: ((err as Error).message +
						' ' +
						(err as Error).stack) as string,
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
