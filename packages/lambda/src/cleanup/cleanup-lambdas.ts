import {
	DeleteFunctionCommand,
	LambdaClient,
	ListFunctionsCommand,
} from '@aws-sdk/client-lambda';
import {RENDER_FN_PREFIX} from '../constants';

export const getRemotionLambdas = async (lambdaClient: LambdaClient) => {
	const lambdas = await lambdaClient.send(new ListFunctionsCommand({}));

	const remotionLambdas = (lambdas.Functions || []).filter((f) =>
		f.FunctionName?.startsWith(RENDER_FN_PREFIX)
	);

	return remotionLambdas;
};

export const cleanupLambdas = async (lambdaClient: LambdaClient) => {
	const remotionLambdas = await getRemotionLambdas(lambdaClient);
	if (remotionLambdas.length === 0) {
		return;
	}

	for (const lambda of remotionLambdas) {
		console.log('Deleting lambda', lambda.FunctionName);
		await lambdaClient.send(
			new DeleteFunctionCommand({
				FunctionName: lambda.FunctionName,
			})
		);
	}

	await cleanupLambdas(lambdaClient);
};
