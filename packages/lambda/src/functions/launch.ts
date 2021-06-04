import {InvokeCommand} from '@aws-sdk/client-lambda';
import fs from 'fs';
import {lambdaClient} from '../aws-clients';
import {collectChunkInformation} from '../chunk-optimization/collect-data';
import {getFrameRangesFromProfile} from '../chunk-optimization/get-frame-ranges-from-profile';
import {getProfileDuration} from '../chunk-optimization/get-profile-duration';
import {optimizeInvocationOrder} from '../chunk-optimization/optimize-invocation-order';
import {optimizeProfileRecursively} from '../chunk-optimization/optimize-profile';
import {planFrameRanges} from '../chunk-optimization/plan-frame-ranges';
import {
	getOptimization,
	writeOptimization,
} from '../chunk-optimization/s3-optimization-file';
import {writeTimingProfile} from '../chunk-optimization/write-profile';
import {concatVideosS3} from '../concat-videos';
import {
	EncodingProgress,
	ENCODING_PROGRESS_KEY,
	LambdaPayload,
	LambdaRoutines,
	OUT_NAME,
	RenderMetadata,
	RENDER_METADATA_KEY,
} from '../constants';
import {getBrowserInstance} from '../get-browser-instance';
import {chunk} from '../helpers/chunk';
import {lambdaWriteFile} from '../io';
import {timer} from '../timer';
import {validateComposition} from '../validate-composition';

const innerLaunchHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	// TODO: Cleanup EFS after render, it is not ephemereal

	// TODO: Better validation
	if (!params.chunkSize) {
		throw new Error('Pass chunkSize');
	}

	const [browserInstance, optimization] = await Promise.all([
		getBrowserInstance(),
		getOptimization(),
	]);

	const comp = await validateComposition({
		serveUrl: params.serveUrl,
		composition: params.composition,
		browserInstance,
		inputProps: params.inputProps,
	});
	// TODO: Better validation
	if (!comp.durationInFrames) {
		throw new Error('Pass durationInFrames');
	}

	console.log(comp);
	const {chunkSize} = params;
	const chunkCount = Math.ceil(comp.durationInFrames / chunkSize);

	const chunks = planFrameRanges({
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
			// TODO: Configurable retries
			retriesLeft: 3,
			inputProps: params.inputProps,
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
	};

	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: RENDER_METADATA_KEY,
		body: JSON.stringify(renderMetadata),
		forceS3: false,
	});

	const payloadChunks = chunk(lambdaPayloads, invokers);
	await Promise.all(
		payloadChunks.map(async (payloads, index) => {
			const callingLambdaTimer = timer('Calling chunk ' + index);
			const firePayload: LambdaPayload = {
				type: LambdaRoutines.fire,
				payloads,
			};
			await lambdaClient.send(
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
			key: ENCODING_PROGRESS_KEY,
			body: JSON.stringify(encodingProgress),
			forceS3: false,
		});
	};

	const out = await concatVideosS3({
		bucket: params.bucketName,
		expectedFiles: chunkCount,
		onProgress,
		numberOfFrames: comp.durationInFrames,
	});
	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: OUT_NAME,
		body: fs.createReadStream(out),
		forceS3: true,
	});
	const chunkData = await collectChunkInformation(params.bucketName);
	await writeTimingProfile({data: chunkData, bucketName: params.bucketName});
	const optimizedProfile = optimizeInvocationOrder(
		optimizeProfileRecursively(chunkData, 400)
	);

	const optimizedFrameRange = getFrameRangesFromProfile(optimizedProfile);
	await writeOptimization(params.bucketName, {
		frameRange: optimizedFrameRange,
		oldTiming: getProfileDuration(chunkData),
		newTiming: getProfileDuration(optimizedProfile),
	});
};

export const launchHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	try {
		await innerLaunchHandler(params);
	} catch (err) {
		console.log('Error occurred', err);
		await lambdaWriteFile({
			bucketName: params.bucketName,
			key: `error-stitcher-${Date.now()}.txt`,
			body: JSON.stringify({
				error: err.message,
			}),
			forceS3: false,
		});
	}
};
