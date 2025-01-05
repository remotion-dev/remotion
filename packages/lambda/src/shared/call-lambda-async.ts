import {InvokeCommand} from '@aws-sdk/client-lambda';
import type {CloudProvider} from '@remotion/serverless';
import type {ServerlessRoutines} from '@remotion/serverless/client';
import type {AwsRegion} from '../regions';
import {getLambdaClient} from './aws-clients';
import type {CallLambdaOptions} from './call-lambda';

export const callLambdaAsync = async <
	T extends ServerlessRoutines,
	Provider extends CloudProvider,
>({
	functionName,
	payload,
	region,
	timeoutInTest,
}: CallLambdaOptions<T, Provider>): Promise<void> => {
	const stringifiedPayload = JSON.stringify(payload);
	if (stringifiedPayload.length > 256 * 1024) {
		throw new Error(
			`Payload is too big: ${stringifiedPayload.length} bytes. Maximum size is 256 KB. This should not happen, please report this to the Remotion team. Payload: ${stringifiedPayload}`,
		);
	}

	const result = await getLambdaClient(region as AwsRegion, timeoutInTest).send(
		new InvokeCommand({
			FunctionName: functionName,
			Payload: stringifiedPayload,
			InvocationType: 'Event',
		}),
	);

	if (result.FunctionError) {
		throw new Error(
			`Lambda function returned error: ${result.FunctionError} ${result.LogResult}`,
		);
	}
};
