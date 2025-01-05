import {InvokeCommand} from '@aws-sdk/client-lambda';
import type {CloudProvider} from '@remotion/serverless';
import type {ServerlessRoutines} from '@remotion/serverless/client';
import type {OrError} from '../functions';
import type {AwsRegion} from '../regions';
import {getLambdaClient} from './aws-clients';
import type {CallLambdaOptions} from './call-lambda';
import type {LambdaReturnValues} from './return-values';

const callLambdaSyncWithoutRetry = async <
	T extends ServerlessRoutines,
	Provider extends CloudProvider,
>({
	functionName,
	type,
	payload,
	region,
	timeoutInTest,
}: CallLambdaOptions<T, Provider>): Promise<
	OrError<LambdaReturnValues<Provider>[T]>
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
		return JSON.parse(decoded) as OrError<LambdaReturnValues<Provider>[T]>;
	} catch {
		throw new Error(`Invalid JSON (${type}): ${JSON.stringify(decoded)}`);
	}
};

export const callLambdaSync = async <
	Provider extends CloudProvider,
	T extends ServerlessRoutines,
>(
	options: CallLambdaOptions<T, Provider>,
): Promise<LambdaReturnValues<Provider>[T]> => {
	const res = await callLambdaSyncWithoutRetry<T, Provider>(options);
	if (res.type === 'error') {
		const err = new Error(res.message);
		err.stack = res.stack;
		throw err;
	}

	return res;
};
