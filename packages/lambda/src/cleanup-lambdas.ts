import {
	DeleteFunctionCommand,
	LambdaClient,
	ListFunctionsCommand,
} from '@aws-sdk/client-lambda';
import xns from 'xns';
import {REGION, RENDER_FN_PREFIX} from './constants';

export const cleanupLambdas = xns(
	async (
		lambdaClient: LambdaClient = new LambdaClient({
			region: REGION,
		})
	) => {
		// TODO: Pagination
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const lambdas = await lambdaClient.send(new ListFunctionsCommand({}));

			const remotionLambdas = (lambdas.Functions || []).filter((f) =>
				f.FunctionName?.startsWith(RENDER_FN_PREFIX)
			);
			if (remotionLambdas.length === 0) {
				break;
			}

			for (const lambda of remotionLambdas) {
				console.log('Deleting lambda', lambda.FunctionName);
				await lambdaClient.send(
					new DeleteFunctionCommand({
						FunctionName: lambda.FunctionName,
					})
				);
			}
		}
	}
);
