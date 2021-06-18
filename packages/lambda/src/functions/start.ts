import {InvokeCommand} from '@aws-sdk/client-lambda';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import {lambdaClient} from '../shared/aws-clients';
import {LambdaPayload, LambdaRoutines} from '../shared/constants';
import {randomHash} from '../shared/random-hash';

export const startHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.start) {
		throw new TypeError('Expected type start');
	}

	const bucketName = await getOrCreateBucket();
	const renderId = randomHash();

	const payload: LambdaPayload = {
		type: LambdaRoutines.launch,
		chunkSize: params.chunkSize,
		composition: params.composition,
		serveUrl: params.serveUrl,
		inputProps: params.inputProps,
		bucketName,
		renderId,
		codec: params.codec,
		imageFormat: params.imageFormat,
		crf: params.crf,
	};
	await lambdaClient.send(
		new InvokeCommand({
			FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
			// @ts-expect-error
			Payload: JSON.stringify(payload),
			InvocationType: 'Event',
		})
	);
	return {
		bucketName,
		renderId,
	};
};
