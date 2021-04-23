import {
	DeleteFunctionCommand,
	LambdaClient,
	ListFunctionsCommand,
} from '@aws-sdk/client-lambda';
import xns from 'xns';
import {REGION, RENDER_FN_PREFIX, RENDER_STITCHER_PREFIX} from './constants';

export const cleanupLambdas = xns(
	async (
		lambdaClient: LambdaClient = new LambdaClient({
			region: REGION,
		})
	) => {
		// TODO: Pagination
		const lambdas = await lambdaClient.send(new ListFunctionsCommand({}));

		if (!lambdas.Functions) {
			return;
		}
		const remotionLambdas = lambdas.Functions.filter(
			(f) =>
				f.FunctionName?.startsWith(RENDER_FN_PREFIX) ||
				f.FunctionName?.startsWith(RENDER_STITCHER_PREFIX)
		);
		for (const lambda of remotionLambdas) {
			console.log('Deleting lambda', lambda.FunctionName);
			await lambdaClient.send(
				new DeleteFunctionCommand({
					FunctionName: lambda.FunctionName,
				})
			);
		}
		console.log('Done!');
	}
);
