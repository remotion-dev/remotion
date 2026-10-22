import {InvokeCommand} from '@aws-sdk/client-lambda';
import {getLambdaClient} from './aws-clients';
import type {AwsRegion} from './regions';
import type {OrError, ServerlessReturnValues} from './return-values';
import type {ServerlessRoutines} from './shared-constants';
import type {CallFunctionOptions} from './types';
import type {RequestHandler} from './types';

const callLambdaSyncWithoutRetry = async <T extends ServerlessRoutines>({
	functionName,
	payload,
	region,
	timeoutInTest,
	requestHandler,
}: CallFunctionOptions<T>): Promise<OrError<ServerlessReturnValues[T]>> => {
	const Payload = JSON.stringify(payload);
	const res = await getLambdaClient(
		region as AwsRegion,
		timeoutInTest,
		(requestHandler ?? null) as RequestHandler | null,
	).send(
		new InvokeCommand({
			FunctionName: functionName,
			Payload,
			InvocationType: 'RequestResponse',
		}),
	);

	if (res.FunctionError) {
		throw new Error(
			`Lambda function returned error: ${res.FunctionError} ${res.LogResult}`,
		);
	}

	if (!res.Payload) {
		throw new Error(
			`Lambda function returned no payload (status ${res.StatusCode})`,
		);
	}

	const decoded = new TextDecoder('utf-8').decode(res.Payload);

	try {
		return JSON.parse(decoded) as OrError<ServerlessReturnValues[T]>;
	} catch {
		throw new Error(`Invalid JSON: ${JSON.stringify(decoded)}`);
	}
};

export const callFunctionSyncImplementation = async <
	T extends ServerlessRoutines,
>(
	options: CallFunctionOptions<T>,
): Promise<ServerlessReturnValues[T]> => {
	const res = await callLambdaSyncWithoutRetry<T>(options);
	if (res.type === 'error') {
		const err = new Error(res.message);
		err.stack = res.stack;
		throw err;
	}

	return res;
};
