import {InvokeCommand} from '@aws-sdk/client-lambda';
import fs from 'fs';
import {lambdaClient} from '../aws-clients';
import {chunk} from '../chunk';
import {collectChunkInformation} from '../chunk-optimization/collect-data';
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

	const browserInstance = await getBrowserInstance();

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

	const chunks = new Array(chunkCount).fill(1).map((_, i) => {
		return [
			i * chunkSize,
			Math.min(comp.durationInFrames, (i + 1) * chunkSize) - 1,
		] as [number, number];
	});
	const invokers = Math.round(Math.sqrt(chunks.length));

	const reqSend = timer('sending off requests');
	const lambdaPayloads = chunks.map((chunkPayload) => {
		const payload: LambdaPayload = {
			type: LambdaRoutines.renderer,
			frameRange: chunkPayload,
			serveUrl: params.serveUrl,
			chunk: chunks.indexOf(chunkPayload),
			composition: params.composition,
			fps: comp.fps,
			height: comp.height,
			width: comp.width,
			durationInFrames: comp.durationInFrames,
			bucketName: params.bucketName,
			retriesLeft: 3,
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
