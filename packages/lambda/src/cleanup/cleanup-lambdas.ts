import {
	DeleteFunctionCommand,
	LambdaClient,
	ListFunctionsCommand,
} from '@aws-sdk/client-lambda';
import {RENDER_FN_PREFIX} from '../shared/constants';

export const getRemotionLambdas = async (lambdaClient: LambdaClient) => {
	const lambdas = await lambdaClient.send(new ListFunctionsCommand({}));

	const remotionLambdas = (lambdas.Functions || []).filter((f) =>
		f.FunctionName?.startsWith(RENDER_FN_PREFIX)
	);

	return remotionLambdas;
};

export const cleanupLambdas = async ({
	lambdaClient,
	onBeforeDelete,
	onAfterDelete,
}: {
	lambdaClient: LambdaClient;
	onBeforeDelete?: (lambdaName: string) => void;
	onAfterDelete?: (lambdaName: string) => void;
}) => {
	const remotionLambdas = await getRemotionLambdas(lambdaClient);
	if (remotionLambdas.length === 0) {
		return;
	}

	for (const lambda of remotionLambdas) {
		onBeforeDelete?.(lambda.FunctionName as string);
		await lambdaClient.send(
			new DeleteFunctionCommand({
				FunctionName: lambda.FunctionName,
			})
		);
		onAfterDelete?.(lambda.FunctionName as string);
	}

	await cleanupLambdas({lambdaClient, onBeforeDelete, onAfterDelete});
};
