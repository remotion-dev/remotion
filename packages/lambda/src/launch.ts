import {InvokeCommand} from '@aws-sdk/client-lambda';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import fs from 'fs';
import {lambdaClient, s3Client} from './aws-clients';
import {chunk} from './chunk';
import {concatVideos, concatVideosS3} from './concat-videos';
import {
	EFS_MOUNT_PATH,
	ENABLE_EFS,
	EncodingProgress,
	ENCODING_PROGRESS_KEY,
	LambdaPayload,
	LambdaRoutines,
	REGION,
	RenderMetadata,
	RENDER_METADATA_KEY,
} from './constants';
import {getBrowserInstance} from './get-browser-instance';
import {timer} from './timer';
import {validateComposition} from './validate-composition';

export const launchHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	const efsRemotionVideoRenderDone = EFS_MOUNT_PATH + '/render-done';

	const efsRemotionVideoPath = EFS_MOUNT_PATH + '/remotion-video';
	if (ENABLE_EFS) {
		if (fs.existsSync(efsRemotionVideoPath)) {
			fs.rmdirSync(efsRemotionVideoPath, {recursive: true});
		}

		fs.mkdirSync(efsRemotionVideoPath);
		if (fs.existsSync(efsRemotionVideoRenderDone)) {
			fs.rmdirSync(efsRemotionVideoRenderDone, {recursive: true});
		}

		fs.mkdirSync(efsRemotionVideoRenderDone);
	}
	// const bucketTimer = timer('Creating bucket');

	// TODO: Better validation
	if (!params.chunkSize) {
		throw new Error('Pass chunkSize');
	}

	// TODO: Better validation
	if (!params.durationInFrames) {
		throw new Error('Pass durationInFrames');
	}

	const browserInstance = await getBrowserInstance();

	const comp = await validateComposition({
		serveUrl: params.serveUrl,
		composition: params.composition,
		browserInstance,
	});
	console.log(comp);
	const {chunkSize} = params;
	const chunkCount = Math.ceil(params.durationInFrames / chunkSize);

	const chunks = new Array(chunkCount).fill(1).map((_, i) => {
		return [
			i * chunkSize,
			Math.min(params.durationInFrames, (i + 1) * chunkSize) - 1,
		] as [number, number];
	});
	const reqSend = timer('sending off requests');
	const lambdaPayloads = chunks.map((chunkPayload) => {
		const payload: LambdaPayload = {
			type: LambdaRoutines.renderer,
			frameRange: chunkPayload,
			serveUrl: params.serveUrl,
			chunk: chunks.indexOf(chunkPayload),
			efsRemotionVideoPath,
			composition: params.composition,
			fps: comp.fps,
			height: comp.height,
			width: comp.width,
			durationInFrames: params.durationInFrames,
			bucketName: params.bucketName,
		};
		return payload;
	});
	const renderMetadata: RenderMetadata = {
		startedDate: Date.now(),
		totalFrames: params.durationInFrames,
	};

	s3Client.send(
		new PutObjectCommand({
			Bucket: params.bucketName,
			Key: RENDER_METADATA_KEY,
			Body: JSON.stringify(renderMetadata),
		})
	);

	const invokers = Math.round(Math.sqrt(lambdaPayloads.length));
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

	const onProgress = (framesRendered: number) => {
		const encodingProgress: EncodingProgress = {
			framesRendered,
		};
		s3Client.send(
			new PutObjectCommand({
				Bucket: params.bucketName,
				Key: ENCODING_PROGRESS_KEY,
				Body: JSON.stringify(encodingProgress),
			})
		);
	};

	const out = ENABLE_EFS
		? await concatVideos({
				efsRemotionVideoPath,
				efsRemotionVideoRenderDone,
				expectedFiles: chunkCount,
				onProgress,
		  })
		: await concatVideosS3({
				s3Client,
				bucket: params.bucketName,
				expectedFiles: lambdaPayloads.length,
				onProgress,
		  });
	const outName = 'out.mp4';
	await s3Client.send(
		new PutObjectCommand({
			Bucket: params.bucketName,
			Key: outName,
			Body: fs.createReadStream(out),
			ACL: 'public-read',
		})
	);
	const url = `https://s3.${REGION}.amazonaws.com/${params.bucketName}/${outName}`;
	return {url};
};
