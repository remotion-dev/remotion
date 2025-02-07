import {InvokeCommand} from '@aws-sdk/client-lambda';
import type {
	CallFunctionOptions,
	CloudProvider,
	OrError,
	ServerlessReturnValues,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import {getLambdaClient} from './aws-clients';
import type {AwsRegion} from './regions';

const callLambdaSyncWithoutRetry = async <
	T extends ServerlessRoutines,
	Provider extends CloudProvider,
>({
	functionName,
	payload,
	region,
	timeoutInTest,
}: CallFunctionOptions<T, Provider>): Promise<
	OrError<ServerlessReturnValues<Provider>[T]>
> => {
	const Payload = JSON.stringify(payload);
	const res = await getLambdaClient(region as AwsRegion, timeoutInTest).send(
		new InvokeCommand({
			FunctionName: functionName,
			Payload,
			InvocationType: 'RequestResponse',
		}),
	);

	const decoded = new TextDecoder('utf-8').decode(res.Payload);

	try {
		return JSON.parse(decoded) as OrError<ServerlessReturnValues<Provider>[T]>;
	} catch {
		throw new Error(`Invalid JSON: ${JSON.stringify(decoded)}`);
	}
};

export const callFunctionSyncImplementation = async <
	Provider extends CloudProvider,
	T extends ServerlessRoutines,
>(
	options: CallFunctionOptions<T, Provider>,
): Promise<ServerlessReturnValues<Provider>[T]> => {
	const res = await callLambdaSyncWithoutRetry<T, Provider>(options);
	if (res.type === 'error') {
		const err = new Error(res.message);
		err.stack = res.stack;
		throw err;
	}

	return res;
};
