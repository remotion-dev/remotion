import type {InvokeWithResponseStreamResponseEvent} from '@aws-sdk/client-lambda';
import {InvokeWithResponseStreamCommand} from '@aws-sdk/client-lambda';
import type {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from './aws-clients';
import type {LambdaPayloads, LambdaRoutines} from './constants';
import type {LambdaReturnValues} from './return-values';

export const callLambda = async <T extends LambdaRoutines>({
	functionName,
	type,
	payload,
	region,
}: {
	functionName: string;
	type: T;
	payload: Omit<LambdaPayloads[T], 'type'>;
	region: AwsRegion;
}): Promise<LambdaReturnValues[T]> => {
	const res = await getLambdaClient(region).send(
		new InvokeWithResponseStreamCommand({
			FunctionName: functionName,
			// @ts-expect-error
			Payload: JSON.stringify({type, ...payload}),
		})
	);

	const events =
		res.EventStream as AsyncIterable<InvokeWithResponseStreamResponseEvent>;
	let responsePayload: Uint8Array = new Uint8Array();

	for await (const event of events) {
		// There are two types of events you can get on a stream.

		// `PayloadChunk`: These contain the actual raw bytes of the chunk
		// It has a single property: `Payload`
		if (event.PayloadChunk) {
			// Decode the raw bytes into a string a human can read
			const decoded = new TextDecoder('utf-8').decode(
				event.PayloadChunk.Payload
			);
			responsePayload = Buffer.concat([responsePayload, Buffer.from(decoded)]);
		}

		if (event.InvokeComplete) {
			if (event.InvokeComplete.ErrorCode) {
				throw new Error(
					`Lambda function ${functionName} failed with error code ${event.InvokeComplete.ErrorCode}: ${event.InvokeComplete.ErrorDetails}}`
				);
			}
		}
	}

	const string = Buffer.from(responsePayload).toString();

	const json = JSON.parse(string) as
		| LambdaReturnValues[T]
		| {
				errorType: string;
				errorMessage: string;
				trace: string[];
		  }
		| {
				statusCode: number;
				headers: Record<string, string>;
				body: string;
		  };

	if ('errorMessage' in json) {
		const err = new Error(json.errorMessage);
		err.name = json.errorType;
		err.stack = (json.trace ?? []).join('\n');
		throw err;
	}

	// Streaming: 3.3.96+
	if ('statusCode' in json) {
		if (json.statusCode !== 200) {
			throw new Error(
				`Lambda function ${functionName} failed with status code ${json.statusCode}: ${json.body}`
			);
		}

		return JSON.parse(json.body) as LambdaReturnValues[T];
	}

	// Non-streaming: 3.3.95 and below
	return json;
};
