import {InvokeCommand} from '@aws-sdk/client-lambda';
import {lambdaClient} from './aws-clients';
import {LambdaPayloads, LambdaRoutines} from './constants';
import {LambdaReturnValues} from './return-values';

export const callLambda = async <T extends LambdaRoutines>({
	functionName,
	type,
	payload,
}: {
	functionName: string;
	type: T;
	payload: Omit<LambdaPayloads[T], 'type'>;
}): Promise<LambdaReturnValues[T]> => {
	const res = await lambdaClient.send(
		new InvokeCommand({
			FunctionName: functionName,
			// @ts-expect-error
			Payload: JSON.stringify({type, ...payload}),
		})
	);
	const string = Buffer.from(res.Payload as Uint8Array).toString();

	return JSON.parse(string) as LambdaReturnValues[T];
};
