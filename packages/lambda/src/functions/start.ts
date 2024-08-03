import {InvokeCommand} from '@aws-sdk/client-lambda';
import type {CloudProvider, ProviderSpecifics} from '@remotion/serverless';
import type {ServerlessPayload} from '@remotion/serverless/client';
import {
	ServerlessRoutines,
	internalGetOrCreateBucket,
	overallProgressKey,
} from '@remotion/serverless/client';
import {VERSION} from 'remotion/version';
import type {AwsRegion} from '../regions';
import {getLambdaClient} from '../shared/aws-clients';
import {
	generateRandomHashWithLifeCycleRule,
	validateDeleteAfter,
} from './helpers/lifecycle';
import {makeInitialOverallRenderProgress} from './helpers/overall-render-progress';

type Options = {
	expectedBucketOwner: string;
	timeoutInMilliseconds: number;
};

export const startHandler = async <Provider extends CloudProvider>(
	params: ServerlessPayload<Provider>,
	options: Options,
	providerSpecifics: ProviderSpecifics<Provider>,
) => {
	if (params.type !== ServerlessRoutines.start) {
		throw new TypeError('Expected type start');
	}

	if (params.version !== VERSION) {
		if (!params.version) {
			throw new Error(
				`Version mismatch: When calling renderMediaOnLambda(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call renderMediaOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`,
			);
		}

		throw new Error(
			`Version mismatch: When calling renderMediaOnLambda(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${params.version}. Deploy a new function and use it to call renderMediaOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`,
		);
	}

	const region = providerSpecifics.getCurrentRegionInFunction();
	const bucketName =
		params.bucketName ??
		(
			await internalGetOrCreateBucket({
				region: providerSpecifics.getCurrentRegionInFunction(),
				enableFolderExpiry: null,
				customCredentials: null,
				providerSpecifics,
			})
		).bucketName;
	const realServeUrl = providerSpecifics.convertToServeUrl({
		urlOrId: params.serveUrl,
		region,
		bucketName,
	});

	validateDeleteAfter(params.deleteAfter);
	const renderId = generateRandomHashWithLifeCycleRule(
		params.deleteAfter,
		providerSpecifics,
	);

	const initialFile = providerSpecifics.writeFile({
		bucketName,
		downloadBehavior: null,
		region,
		body: JSON.stringify(
			makeInitialOverallRenderProgress(
				options.timeoutInMilliseconds + Date.now(),
			),
		),
		expectedBucketOwner: options.expectedBucketOwner,
		key: overallProgressKey(renderId),
		privacy: 'private',
		customCredentials: null,
	});

	const payload: ServerlessPayload<Provider> = {
		type: ServerlessRoutines.launch,
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
		x264Preset: params.x264Preset,
		jpegQuality: params.jpegQuality,
		maxRetries: params.maxRetries,
		privacy: params.privacy,
		logLevel: params.logLevel,
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
		encodingBufferSize: params.encodingBufferSize,
		encodingMaxRate: params.encodingMaxRate,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		rendererFunctionName: params.rendererFunctionName,
		audioCodec: params.audioCodec,
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		deleteAfter: params.deleteAfter,
		colorSpace: params.colorSpace,
		preferLossless: params.preferLossless,
	};

	// Don't replace with callLambda(), we want to return before the render is snone
	const result = await getLambdaClient(
		providerSpecifics.getCurrentRegionInFunction() as AwsRegion,
	).send(
		new InvokeCommand({
			FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
			Payload: JSON.stringify(payload),
			InvocationType: 'Event',
		}),
	);
	if (result.FunctionError) {
		throw new Error(
			`Lambda function returned error: ${result.FunctionError} ${result.LogResult}`,
		);
	}

	await initialFile;

	return {
		type: 'success' as const,
		bucketName,
		renderId,
	};
};
