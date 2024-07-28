/* eslint-disable @typescript-eslint/no-use-before-define */
import type {
	InvokeWithResponseStreamCommandOutput,
	InvokeWithResponseStreamResponseEvent,
} from '@aws-sdk/client-lambda';
import {
	InvokeCommand,
	InvokeWithResponseStreamCommand,
} from '@aws-sdk/client-lambda';
import type {
	MessageTypeId,
	OnMessage,
	StreamingMessage,
} from '@remotion/serverless';
import {formatMap, messageTypeIdToMessageType} from '@remotion/serverless';
import type {
	ServerlessPayloads,
	ServerlessRoutines,
} from '@remotion/serverless/client';
import {makeStreamer} from '@remotion/streaming';
import type {OrError} from '../functions';
import type {AwsRegion} from '../regions';
import {getLambdaClient} from './aws-clients';
import type {LambdaReturnValues} from './return-values';

const INVALID_JSON_MESSAGE = 'Cannot parse Lambda response as JSON';

type Options<T extends ServerlessRoutines, Region extends string> = {
	functionName: string;
	type: T;
	payload: Omit<ServerlessPayloads<Region>[T], 'type'>;
	region: Region;
	timeoutInTest: number;
};

const parseJsonOrThrowSource = (data: Uint8Array, type: string) => {
	const asString = new TextDecoder('utf-8').decode(data);
	try {
		return JSON.parse(asString);
	} catch (err) {
		throw new Error(`Invalid JSON (${type}): ${asString}`);
	}
};

export const callLambda = async <
	T extends ServerlessRoutines,
	Region extends string,
>(
	options: Options<T, Region> & {},
): Promise<LambdaReturnValues<Region>[T]> => {
	// Do not remove this await
	const res = await callLambdaWithoutRetry<T, Region>(options);
	if (res.type === 'error') {
		const err = new Error(res.message);
		err.stack = res.stack;
		throw err;
	}

	return res;
};

export const callLambdaWithStreaming = async <
	T extends ServerlessRoutines,
	Region extends string,
>(
	options: Options<T, Region> & {
		receivedStreamingPayload: OnMessage;
		retriesRemaining: number;
	},
): Promise<void> => {
	// As of August 2023, Lambda streaming sometimes misses parts of the JSON response.
	// Handling this for now by applying a retry mechanism.

	try {
		// Do not remove this await
		await callLambdaWithStreamingWithoutRetry<T, Region>(options);
	} catch (err) {
		if (options.retriesRemaining === 0) {
			throw err;
		}

		if (
			!(err as Error).message.includes(INVALID_JSON_MESSAGE) &&
			!(err as Error).message.includes(LAMBDA_STREAM_STALL) &&
			!(err as Error).message.includes('aborted')
		) {
			throw err;
		}

		console.error(err);
		console.error('Retries remaining', options.retriesRemaining);

		return callLambdaWithStreaming({
			...options,
			retriesRemaining: options.retriesRemaining - 1,
		});
	}
};

const callLambdaWithoutRetry = async <
	T extends ServerlessRoutines,
	Region extends string,
>({
	functionName,
	type,
	payload,
	region,
	timeoutInTest,
}: Options<T, Region>): Promise<OrError<LambdaReturnValues<Region>[T]>> => {
	const Payload = JSON.stringify({type, ...payload});
	const res = await getLambdaClient(region as AwsRegion, timeoutInTest).send(
		new InvokeCommand({
			FunctionName: functionName,
			Payload,
			InvocationType: 'RequestResponse',
		}),
	);

	const decoded = new TextDecoder('utf-8').decode(res.Payload);

	try {
		return JSON.parse(decoded) as OrError<LambdaReturnValues<Region>[T]>;
	} catch (err) {
		throw new Error(`Invalid JSON (${type}): ${JSON.stringify(decoded)}`);
	}
};

const STREAM_STALL_TIMEOUT = 30000;
const LAMBDA_STREAM_STALL = `AWS did not invoke Lambda in ${STREAM_STALL_TIMEOUT}ms`;

const invokeStreamOrTimeout = async <Region extends string>({
	region,
	timeoutInTest,
	functionName,
	type,
	payload,
}: {
	region: Region;
	timeoutInTest: number;
	functionName: string;
	type: string;
	payload: Record<string, unknown>;
}) => {
	const resProm = getLambdaClient(region as AwsRegion, timeoutInTest).send(
		new InvokeWithResponseStreamCommand({
			FunctionName: functionName,
			Payload: JSON.stringify({type, ...payload}),
		}),
	);

	let cleanup = () => undefined;

	const timeout = new Promise<InvokeWithResponseStreamCommandOutput>(
		(_resolve, reject) => {
			const int = setTimeout(() => {
				reject(new Error(LAMBDA_STREAM_STALL));
			}, STREAM_STALL_TIMEOUT);
			cleanup = () => {
				clearTimeout(int);
			};
		},
	);

	const res = await Promise.race([resProm, timeout]);

	cleanup();

	return res;
};

const callLambdaWithStreamingWithoutRetry = async <
	T extends ServerlessRoutines,
	Region extends string,
>({
	functionName,
	type,
	payload,
	region,
	timeoutInTest,
	receivedStreamingPayload,
}: Options<T, Region> & {
	receivedStreamingPayload: OnMessage;
}): Promise<void> => {
	const res = await invokeStreamOrTimeout({
		functionName,
		payload,
		region,
		timeoutInTest,
		type,
	});

	const {onData, clear} = makeStreamer((status, messageTypeId, data) => {
		const messageType = messageTypeIdToMessageType(
			messageTypeId as MessageTypeId,
		);
		const innerPayload =
			formatMap[messageType] === 'json'
				? parseJsonOrThrowSource(data, messageType)
				: data;

		const message: StreamingMessage = {
			successType: status,
			message: {
				type: messageType,
				payload: innerPayload,
			},
		};

		receivedStreamingPayload(message);
	});

	const events =
		res.EventStream as AsyncIterable<InvokeWithResponseStreamResponseEvent>;

	for await (const event of events) {
		// There are two types of events you can get on a stream.

		// `PayloadChunk`: These contain the actual raw bytes of the chunk
		// It has a single property: `Payload`
		if (event.PayloadChunk && event.PayloadChunk.Payload) {
			onData(event.PayloadChunk.Payload);
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

		// Don't put a `break` statement here, as it will cause the socket to not properly exit.
	}

	clear();
};
