import {VERSION} from 'remotion/version';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import type {LambdaPayload} from '../shared/constants';
import {initalizedMetadataKey, LambdaRoutines} from '../shared/constants';
import {convertToServeUrl} from '../shared/convert-to-serve-url';
import {randomHash} from '../shared/random-hash';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {lambdaWriteFile} from './helpers/io';
import {callLambda} from '../shared/call-lambda';

type Options = {
	expectedBucketOwner: string;
};

export const startHandler = async (params: LambdaPayload, options: Options) => {
	if (params.type !== LambdaRoutines.start) {
		throw new TypeError('Expected type start');
	}

	if (params.version !== VERSION) {
		if (!params.version) {
			throw new Error(
				`Version mismatch: When calling renderMediaOnLambda(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call renderMediaOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`
			);
		}

		throw new Error(
			`Version mismatch: When calling renderMediaOnLambda(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${params.version}. Deploy a new function and use it to call renderMediaOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`
		);
	}

	const region = getCurrentRegionInFunction();
	const bucketName =
		params.bucketName ??
		(
			await getOrCreateBucket({
				region: getCurrentRegionInFunction(),
			})
		).bucketName;
	const realServeUrl = convertToServeUrl({
		urlOrId: params.serveUrl,
		region,
		bucketName,
	});

	const renderId = randomHash({randomInTests: true});

	const initialFile = lambdaWriteFile({
		bucketName,
		downloadBehavior: null,
		region,
		body: 'Render was initialized',
		expectedBucketOwner: options.expectedBucketOwner,
		key: initalizedMetadataKey(renderId),
		privacy: 'private',
		customCredentials: null,
	});

	const payload: LambdaPayload = {
		type: LambdaRoutines.launch,
		framesPerLambda: params.framesPerLambda,
		composition: params.composition,
		serveUrl: realServeUrl,
		inputProps: params.inputProps,
		bucketName,
		renderId,
		codec: params.codec,
		imageFormat: params.imageFormat,
		crf: params.crf,
		envVariables: params.envVariables,
		pixelFormat: params.pixelFormat,
		proResProfile: params.proResProfile,
		jpegQuality: params.jpegQuality,
		maxRetries: params.maxRetries,
		privacy: params.privacy,
		logLevel: params.logLevel ?? 'info',
		frameRange: params.frameRange,
		outName: params.outName,
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		chromiumOptions: params.chromiumOptions,
		scale: params.scale,
		numberOfGifLoops: params.numberOfGifLoops,
		everyNthFrame: params.everyNthFrame,
		concurrencyPerLambda: params.concurrencyPerLambda,
		downloadBehavior: params.downloadBehavior,
		muted: params.muted,
		overwrite: params.overwrite,
		webhook: params.webhook,
		audioBitrate: params.audioBitrate,
		videoBitrate: params.videoBitrate,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		rendererFunctionName: params.rendererFunctionName,
		audioCodec: params.audioCodec,
	};

	await callLambda({
		payload,
		functionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
		region: getCurrentRegionInFunction(),
		type: LambdaRoutines.launch,
		receivedStreamingPayload: () => undefined,
		timeoutInTest: 120000,
	});
	await initialFile;

	return {
		type: 'success' as const,
		bucketName,
		renderId,
	};
};
