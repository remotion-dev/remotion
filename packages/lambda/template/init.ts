import {InvokeCommand} from '@aws-sdk/client-lambda';
import {CreateBucketCommand, PutObjectCommand} from '@aws-sdk/client-s3';
import fs from 'fs';
import {concatVideos, concatVideosS3} from '../src/concat-videos';
import {
	EFS_MOUNT_PATH,
	ENABLE_EFS,
	LambdaPayload,
	REGION,
	RENDERS_BUCKET_PREFIX,
} from '../src/constants';
import {timer} from '../src/timer';
import {lambdaClient, s3Client} from './aws-clients';
import {getBrowserInstance} from './get-browser-instance';
import {validateComposition} from './validate-composition';

export const initHandler = async (params: LambdaPayload) => {
	if (params.type !== 'init') {
		return;
	}
	const efsRemotionVideoRenderDone = EFS_MOUNT_PATH + '/render-done';

	const bucketName = RENDERS_BUCKET_PREFIX + Math.random();
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
	const bucketTimer = timer('creating bucket');
	await s3Client.send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);
	bucketTimer.end();
	const {chunkSize} = params;
	const chunkCount = Math.ceil(params.durationInFrames / chunkSize);

	const chunks = new Array(chunkCount).fill(1).map((_, i) => {
		return [
			i * chunkSize,
			Math.min(params.durationInFrames, (i + 1) * chunkSize) - 1,
		] as [number, number];
	});
	const reqSend = timer('sending off requests');
	await Promise.all(
		chunks.map(async (chunk) => {
			const payload: LambdaPayload = {
				type: 'renderer',
				frameRange: chunk,
				serveUrl: params.serveUrl,
				chunk: chunks.indexOf(chunk),
				efsRemotionVideoPath,
				composition: params.composition,
				fps: comp.fps,
				height: comp.height,
				width: comp.width,
				durationInFrames: params.durationInFrames,
				bucketName,
			};
			const callingLambdaTimer = timer(
				'Calling lambda ' + chunks.indexOf(chunk)
			);
			await lambdaClient.send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(payload),
					InvocationType: 'Event',
				}),
				{}
			);
			callingLambdaTimer.end();
		})
	);
	reqSend.end();
	const out = ENABLE_EFS
		? await concatVideos(
				efsRemotionVideoPath,
				efsRemotionVideoRenderDone,
				chunkCount
		  )
		: await concatVideosS3(s3Client, bucketName);
	const outName = 'out.mp4';
	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: 'out.mp4',
			Body: fs.createReadStream(out),
			ACL: 'public-read',
		})
	);
	console.log(
		'Done! ' + `https://s3.${REGION}.amazonaws.com/${bucketName}/${outName}`
	);
};
