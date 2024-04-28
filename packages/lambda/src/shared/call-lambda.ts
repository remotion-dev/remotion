/* eslint-disable @typescript-eslint/no-use-before-define */
import type {InvokeWithResponseStreamResponseEvent} from '@aws-sdk/client-lambda';
import {InvokeWithResponseStreamCommand} from '@aws-sdk/client-lambda';
import type {OnMessage} from '../functions/streaming/streaming';
import {makeStreaming} from '../functions/streaming/streaming';
import type {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from './aws-clients';
import type {LambdaPayloads, LambdaRoutines} from './constants';
import type {LambdaReturnValues, OrError} from './return-values';

const INVALID_JSON_MESSAGE = 'Cannot parse Lambda response as JSON';

type Options<T extends LambdaRoutines> = {
	functionName: string;
	type: T;
	payload: Omit<LambdaPayloads[T], 'type'>;
	region: AwsRegion;
	timeoutInTest: number;
	onMessage: OnMessage;
};

const parseJsonWithErrorSurfacing = ({
	input,
	type,
}: {
	input: string;
	type: string;
}) => {
	try {
		return JSON.parse(input);
	} catch {
		throw new Error(
			`${INVALID_JSON_MESSAGE}. Invoking: ${type} Response: ${JSON.stringify(input)}`,
		);
	}
};

const parseJson = <T extends LambdaRoutines>({
	input,
	type,
}: {
	input: string;
	type: string;
}) => {
	let json = parseJsonWithErrorSurfacing({input, type}) as
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
		json = parseJsonWithErrorSurfacing({input: json.body, type}) as
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
			`Lambda function failed with status code ${json.statusCode}`,
		);
	}

	if (json.type === 'error') {
		const err = new Error(json.message);
		err.stack = json.stack;
		throw err;
	}

	return json;
};

export const callLambda = async <T extends LambdaRoutines>(
	options: Options<T> & {
		retriesRemaining: number;
	},
): Promise<LambdaReturnValues[T]> => {
	// As of August 2023, Lambda streaming sometimes misses parts of the JSON response.
	// Handling this for now by applying a retry mechanism.

	try {
		// Do not remove this await
		const res = await callLambdaWithoutRetry<T>(options);
		return res;
	} catch (err) {
		if (options.retriesRemaining === 0) {
			throw err;
		}

		if (!(err as Error).message.includes(INVALID_JSON_MESSAGE)) {
			throw err;
		}

		return callLambda({
			...options,
			retriesRemaining: options.retriesRemaining - 1,
		});
	}
};

const callLambdaWithoutRetry = async <T extends LambdaRoutines>({
	functionName,
	type,
	payload,
	region,
	timeoutInTest,
	onMessage,
}: Options<T>): Promise<LambdaReturnValues[T]> => {
	const res = await getLambdaClient(region, timeoutInTest).send(
		new InvokeWithResponseStreamCommand({
			FunctionName: functionName,
			Payload: JSON.stringify({type, ...payload}),
		}),
	);

	let responseJson: Record<string, unknown> | null = null;

	const {addData} = makeStreaming({
		onMessage: (message) => {
			if (message.message.type === 'response-json') {
				responseJson = message.message.payload;
			} else {
				onMessage(message);
			}
		},
	});

	const events =
		res.EventStream as AsyncIterable<InvokeWithResponseStreamResponseEvent>;
	let responsePayload = '';

	for await (const event of events) {
		// There are two types of events you can get on a stream.

		// `PayloadChunk`: These contain the actual raw bytes of the chunk
		// It has a single property: `Payload`
		if (event.PayloadChunk && event.PayloadChunk.Payload) {
			addData(Buffer.from(event.PayloadChunk.Payload));
			// Decode the raw bytes into a string a human can read
			const decoded = new TextDecoder('utf-8').decode(
				event.PayloadChunk.Payload,
			);
			// TODO: Replace the streaming payload of render-id-determined
			responsePayload += decoded;
		}

		if (event.InvokeComplete) {
			if (event.InvokeComplete.ErrorCode) {
				const logs = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-3600~timeType~'RELATIVE~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*0a*7c*20filter*20*40requestId*20like*20*${res.$metadata.requestId}*22*0a*7c*20sort*20*40timestamp*20asc~source~(~'*2faws*2flambda*2f${functionName}))`;
				if (event.InvokeComplete.ErrorCode === 'Unhandled') {
					throw new Error(
						`Lambda function ${functionName} failed with an unhandled error: ${
							event.InvokeComplete.ErrorDetails as string
						} See ${logs} to see the logs of this invocation.`,
					);
				}

				throw new Error(
					`Lambda function ${functionName} failed with error code ${event.InvokeComplete.ErrorCode}: ${event.InvokeComplete.ErrorDetails}. See ${logs} to see the logs of this invocation.`,
				);
			}
		}
	}

	if (responseJson) {
		return responseJson as LambdaReturnValues[T];
	}

	const json = parseJson<T>({input: responsePayload.trim(), type});

	return json;
};
