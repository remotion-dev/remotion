import {InvokeCommand} from '@aws-sdk/client-lambda';
import {Log} from '@remotion/cli/dist/log';
import fs from 'fs';
import {Internals} from 'remotion';
import {getLambdaClient} from '../shared/aws-clients';
import {chunk} from '../shared/chunk';
import {
	EncodingProgress,
	encodingProgressKey,
	LambdaPayload,
	LambdaRoutines,
	outName,
	RenderMetadata,
	renderMetadataKey,
} from '../shared/constants';
import {getServeUrlHash} from '../shared/make-s3-url';
import {collectChunkInformation} from './chunk-optimization/collect-data';
import {getFrameRangesFromProfile} from './chunk-optimization/get-frame-ranges-from-profile';
import {getProfileDuration} from './chunk-optimization/get-profile-duration';
import {optimizeInvocationOrder} from './chunk-optimization/optimize-invocation-order';
import {optimizeProfileRecursively} from './chunk-optimization/optimize-profile';
import {planFrameRanges} from './chunk-optimization/plan-frame-ranges';
import {
	getOptimization,
	writeOptimization,
} from './chunk-optimization/s3-optimization-file';
import {writeTimingProfile} from './chunk-optimization/write-profile';
import {concatVideosS3} from './helpers/concat-videos';
import {closeBrowser, getBrowserInstance} from './helpers/get-browser-instance';
import {getCurrentRegion} from './helpers/get-current-region';
import {lambdaWriteFile} from './helpers/io';
import {timer} from './helpers/timer';
import {validateComposition} from './helpers/validate-composition';
import {writeLambdaError} from './helpers/write-lambda-error';

type Options = {
	expectedBucketOwner: string;
};

const innerLaunchHandler = async (params: LambdaPayload, options: Options) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	// TODO: Better validation
	if (!params.chunkSize) {
		throw new Error('Pass chunkSize');
	}

	const [browserInstance, optimization] = await Promise.all([
		getBrowserInstance(),
		getOptimization({
			bucketName: params.bucketName,
			siteId: getServeUrlHash(params.serveUrl),
			compositionId: params.composition,
			region: getCurrentRegion(),
			expectedBucketOwner: options.expectedBucketOwner,
		}),
	]);

	const comp = await validateComposition({
		serveUrl: params.serveUrl,
		composition: params.composition,
		browserInstance,
		inputProps: params.inputProps,
		onError: ({err}) => {
			writeLambdaError({
				bucketName: params.bucketName,
				errorInfo: {
					chunk: null,
					frame: null,
					isFatal: false,
					stack: err.stack as string,
					type: 'browser',
				},
				expectedBucketOwner: options.expectedBucketOwner,
				renderId: params.renderId,
			});
		},
	});
	Internals.validateDurationInFrames(
		comp.durationInFrames,
		'passed to <Component />'
	);
	Internals.validateFps(comp.fps, 'passed to <Component />');
	Internals.validateDimension(comp.height, 'height', 'passed to <Component />');
	Internals.validateDimension(comp.width, 'width', 'passed to <Component />');

	const {chunkSize} = params;
	const chunkCount = Math.ceil(comp.durationInFrames / chunkSize);

	const {chunks, didUseOptimization} = planFrameRanges({
		chunkCount,
		chunkSize,
		frameCount: comp.durationInFrames,
		optimization,
	});
	const sortedChunks = chunks.slice().sort((a, b) => a[0] - b[0]);
	const invokers = Math.round(Math.sqrt(chunks.length));

	const reqSend = timer('sending off requests');
	const lambdaPayloads = chunks.map((chunkPayload) => {
		const payload: LambdaPayload = {
			type: LambdaRoutines.renderer,
			frameRange: chunkPayload,
			serveUrl: params.serveUrl,
			chunk: sortedChunks.indexOf(chunkPayload),
			composition: params.composition,
			fps: comp.fps,
			height: comp.height,
			width: comp.width,
			durationInFrames: comp.durationInFrames,
			bucketName: params.bucketName,
			retriesLeft: params.maxRetries,
			inputProps: params.inputProps,
			renderId: params.renderId,
			imageFormat: params.imageFormat,
			codec: params.codec,
			crf: params.crf,
			envVariables: params.envVariables,
			pixelFormat: params.pixelFormat,
			proResProfile: params.proResProfile,
			quality: params.quality,
		};
		return payload;
	});
	const renderMetadata: RenderMetadata = {
		startedDate: Date.now(),
		totalFrames: comp.durationInFrames,
		totalChunks: chunks.length,
		estimatedLambdaInvokations: [
			// Direct invokations
			chunks.length,
			// Parent invokers
			invokers,
			// This function
		].reduce((a, b) => a + b, 0),
		compositionId: comp.id,
		siteId: getServeUrlHash(params.serveUrl),
		codec: params.codec,
		usesOptimizationProfile: didUseOptimization,
	};

	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: renderMetadataKey(params.renderId),
		body: JSON.stringify(renderMetadata),
		region: getCurrentRegion(),
		acl: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
	});

	const payloadChunks = chunk(lambdaPayloads, invokers);
	await Promise.all(
		payloadChunks.map(async (payloads, index) => {
			const callingLambdaTimer = timer('Calling chunk ' + index);
			const firePayload: LambdaPayload = {
				type: LambdaRoutines.fire,
				payloads,
				renderId: params.renderId,
			};
			await getLambdaClient(getCurrentRegion()).send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(firePayload),
					InvocationType: 'Event',
				}),
				{}
			);
			callingLambdaTimer.end();
		})
	);
	reqSend.end();

	// TODO: Should throttle?
	const onProgress = (framesRendered: number) => {
		const encodingProgress: EncodingProgress = {
			framesRendered,
		};
		lambdaWriteFile({
			bucketName: params.bucketName,
			key: encodingProgressKey(params.renderId),
			body: JSON.stringify(encodingProgress),
			region: getCurrentRegion(),
			acl: 'private',
			expectedBucketOwner: options.expectedBucketOwner,
		});
	};

	// TODO: Should clean up afterwards
	const out = await concatVideosS3({
		bucket: params.bucketName,
		expectedFiles: chunkCount,
		onProgress,
		numberOfFrames: comp.durationInFrames,
		renderId: params.renderId,
		region: getCurrentRegion(),
		codec: params.codec,
		expectedBucketOwner: options.expectedBucketOwner,
	});
	// TODO: Enable or disable chunk optimization
	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: outName(params.renderId, params.codec),
		body: fs.createReadStream(out),
		region: getCurrentRegion(),
		acl: 'public-read',
		expectedBucketOwner: options.expectedBucketOwner,
	});
	const chunkData = await collectChunkInformation({
		bucketName: params.bucketName,
		renderId: params.renderId,
		region: getCurrentRegion(),
		expectedBucketOwner: options.expectedBucketOwner,
	});
	await writeTimingProfile({
		data: chunkData,
		bucketName: params.bucketName,
		renderId: params.renderId,
		expectedBucketOwner: options.expectedBucketOwner,
	});
	const optimizedProfile = optimizeInvocationOrder(
		optimizeProfileRecursively(chunkData, 400)
	);

	const optimizedFrameRange = getFrameRangesFromProfile(optimizedProfile);
	await writeOptimization({
		bucketName: params.bucketName,
		optimization: {
			frameRange: optimizedFrameRange,
			oldTiming: getProfileDuration(chunkData),
			newTiming: getProfileDuration(optimizedProfile),
			frameCount: comp.durationInFrames,
			createdFromRenderId: params.renderId,
		},
		expectedBucketOwner: options.expectedBucketOwner,
		compositionId: params.composition,
		siteId: getServeUrlHash(params.serveUrl),
		region: getCurrentRegion(),
	});
};

export const launchHandler = async (
	params: LambdaPayload,
	options: Options
) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	try {
		await innerLaunchHandler(params, options);
	} catch (err) {
		Log.error('Error occurred', err);
		await writeLambdaError({
			bucketName: params.bucketName,
			errorInfo: {
				chunk: null,
				frame: null,
				stack: err.stack,
				type: 'stitcher',
				isFatal: true,
			},
			expectedBucketOwner: options.expectedBucketOwner,
			renderId: params.renderId,
		});
	} finally {
		await closeBrowser();
	}
};
