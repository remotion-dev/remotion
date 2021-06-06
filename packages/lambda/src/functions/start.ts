import {InvokeCommand} from '@aws-sdk/client-lambda';
import {lambdaClient} from '../aws-clients';
import {LambdaPayload, LambdaRoutines} from '../constants';
import {getOrMakeBucket} from '../get-or-make-bucket';
import {randomHash} from '../helpers/random-hash';

export const startHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.start) {
		throw new TypeError('Expected type start');
	}

	const bucketName = await getOrMakeBucket();
	const renderId = randomHash();

	const payload: LambdaPayload = {
		type: LambdaRoutines.launch,
		chunkSize: params.chunkSize,
		composition: params.composition,
		serveUrl: params.serveUrl,
		inputProps: params.inputProps,
		bucketName,
		renderId,
	};
	const launchEvent = await lambdaClient.send(
		new InvokeCommand({
			FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
			// @ts-expect-error
			Payload: JSON.stringify(payload),
			InvocationType: 'Event',
		})
	);
	return {
		bucketName,
		launchEvent,
		renderId,
	};
};
