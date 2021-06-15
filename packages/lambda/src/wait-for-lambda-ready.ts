import {GetFunctionCommand} from '@aws-sdk/client-lambda';
import {sleep} from './helpers/sleep';
import {lambdaClient} from './shared/aws-clients';

type FunctionState = 'Pending' | 'Active' | 'Inactive' | 'Failed' | 'Unknown';

const getState = async (functionName: string): Promise<FunctionState> => {
	const response = await lambdaClient.send(
		new GetFunctionCommand({
			FunctionName: functionName,
		})
	);
	return (
		(response.Configuration?.State as FunctionState | undefined) ?? 'Unknown'
	);
};

export const waitForLambdaReady = async (functionName: string) => {
	let state = await getState(functionName);
	while (state !== 'Active') {
		console.log(
			`Waiting for function to become active. Currently is ${state}...`
		);
		await sleep(1000);
		state = await getState(functionName);
	}
};
