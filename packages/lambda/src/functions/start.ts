import {InvokeCommand} from '@aws-sdk/client-lambda';
import {VERSION} from 'remotion/version';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import {getLambdaClient} from '../shared/aws-clients';
import type {LambdaPayload} from '../shared/constants';
import {initalizedMetadataKey, LambdaRoutines} from '../shared/constants';
import {randomHash} from '../shared/random-hash';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {lambdaWriteFile} from './helpers/io';

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

	const {bucketName} = await getOrCreateBucket({
		region: getCurrentRegionInFunction(),
	});

	const renderId = randomHash({randomInTests: true});

	const initialFile = lambdaWriteFile({
		bucketName,
		downloadBehavior: null,
		region: getCurrentRegionInFunction(),
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
		serveUrl: params.serveUrl,
		inputProps: params.inputProps,
		bucketName,
		renderId,
		codec: params.codec,
		imageFormat: params.imageFormat,
		crf: params.crf,
		envVariables: params.envVariables,
		pixelFormat: params.pixelFormat,
		proResProfile: params.proResProfile,
		quality: params.quality,
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
	};
	await getLambdaClient(getCurrentRegionInFunction()).send(
		new InvokeCommand({
			FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
			// @ts-expect-error
			Payload: JSON.stringify(payload),
			InvocationType: 'Event',
		})
	);
	await initialFile;
	return {
		bucketName,
		renderId,
	};
};
