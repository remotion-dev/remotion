import type {InvokeWithResponseStreamResponseEvent} from '@aws-sdk/client-lambda';
import {InvokeWithResponseStreamCommand} from '@aws-sdk/client-lambda';
import type {StreamingPayloads} from '../functions/helpers/streaming-payloads';
import {isStreamingPayload} from '../functions/helpers/streaming-payloads';
import type {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from './aws-clients';
import type {LambdaPayloads, LambdaRoutines} from './constants';
import type {LambdaReturnValues, OrError} from './return-values';

export const callLambda = async <T extends LambdaRoutines>({
	functionName,
	type,
	payload,
	region,
	receivedStreamingPayload,
	timeoutInTest,
}: {
	functionName: string;
	type: T;
	payload: Omit<LambdaPayloads[T], 'type'>;
	region: AwsRegion;
	receivedStreamingPayload: (streamPayload: StreamingPayloads) => void;
	timeoutInTest: number;
}): Promise<LambdaReturnValues[T]> => {
	const res = await getLambdaClient(region, timeoutInTest).send(
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
			const streamPayload = isStreamingPayload(decoded);

			if (streamPayload) {
				receivedStreamingPayload(streamPayload);
				continue;
			}

			responsePayload = Buffer.concat([responsePayload, Buffer.from(decoded)]);
		}

		if (event.InvokeComplete) {
			if (event.InvokeComplete.ErrorCode) {
				throw new Error(
					`Lambda function ${functionName} failed with error code ${event.InvokeComplete.ErrorCode}: ${event.InvokeComplete.ErrorDetails}`
				);
			}
		}
	}

	const string = Buffer.from(responsePayload).toString();
	const json = parseJson<T>(string);

	return json;
};

const parseJson = <T extends LambdaRoutines>(input: string) => {
	let json = JSON.parse(input) as
		| OrError<Awaited<LambdaReturnValues[T]>>
		| {
				errorType: string;
				errorMessage: string;
				trace: string[];
		  }
		| {
				statusCode: string;
				body: string;
		  };

	if ('statusCode' in json) {
		json = JSON.parse(json.body) as
			| OrError<Awaited<LambdaReturnValues[T]>>
			| {
					errorType: string;
					errorMessage: string;
					trace: string[];
			  };
	}

	if ('errorMessage' in json) {
		const err = new Error(json.errorMessage);
		err.name = json.errorType;
		err.stack = (json.trace ?? []).join('\n');
		throw err;
	}

	// This will not happen, it is for narrowing purposes
	if ('statusCode' in json) {
		throw new Error(
			`Lambda function failed with status code ${json.statusCode}`
		);
	}

	if (json.type === 'error') {
		const err = new Error(json.message);
		err.stack = json.stack;
		throw err;
	}

	return json;
};
