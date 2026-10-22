import {InvokeCommand} from '@aws-sdk/client-lambda';
import {getLambdaClient} from './aws-clients';
import type {AwsRegion} from './regions';
import type {ServerlessRoutines} from './shared-constants';
import type {CallFunctionOptions} from './types';
import type {RequestHandler} from './types';

export const callFunctionAsyncImplementation = async <
	T extends ServerlessRoutines,
>({
	functionName,
	payload,
	region,
	timeoutInTest,
	requestHandler,
}: CallFunctionOptions<T>): Promise<void> => {
	const stringifiedPayload = JSON.stringify(payload);
	const byteLength = Buffer.byteLength(stringifiedPayload);
	if (byteLength > 256 * 1024) {
		throw new Error(
			`Payload is too big: ${byteLength} bytes. Maximum size is 256 KB. This should not happen, please report this to the Remotion team.`,
		);
	}

	const result = await getLambdaClient(
		region as AwsRegion,
		timeoutInTest,
		(requestHandler ?? null) as RequestHandler | null,
	).send(
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
