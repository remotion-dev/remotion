import {InvokeCommand} from '@aws-sdk/client-lambda';
import {CreateBucketCommand} from '@aws-sdk/client-s3';
import {lambdaClient, s3Client} from '../aws-clients';
import {
	LambdaPayload,
	LambdaRoutines,
	RENDERS_BUCKET_PREFIX,
} from '../constants';
import {timer} from '../timer';

export const startHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.start) {
		throw new TypeError('Expected type start');
	}

	const bucketName = RENDERS_BUCKET_PREFIX + Math.random();
	const bucketTimer = timer('creating bucket');
	await s3Client.send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);
	const payload: LambdaPayload = {
		type: LambdaRoutines.launch,
		chunkSize: params.chunkSize,
		composition: params.composition,
		durationInFrames: params.durationInFrames,
		serveUrl: params.serveUrl,
		bucketName,
	};
	const launchEvent = await lambdaClient.send(
		new InvokeCommand({
			FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
			// @ts-expect-error
			Payload: JSON.stringify(payload),
			InvocationType: 'Event',
		})
	);
	bucketTimer.end();
	return {
		bucketName,
		launchEvent,
	};
};
