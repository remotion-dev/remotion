import {InvokeCommand} from '@aws-sdk/client-lambda';
import {lambdaClient} from './aws-clients';
import {LambdaPayload} from './constants';
import {LambdaReturnValues} from './return-values';

export const callLambda = async (
	functionName: string,
	payload: LambdaPayload
) => {
	const res = await lambdaClient.send(
		new InvokeCommand({
			FunctionName: functionName,
			// @ts-expect-error
			Payload: JSON.stringify(payload),
		})
	);
	const string = Buffer.from(res.Payload as Uint8Array).toString();

	return JSON.parse(string) as LambdaReturnValues[typeof payload.type];
};
