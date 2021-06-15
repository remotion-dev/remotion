import {ListFunctionsCommand} from '@aws-sdk/client-lambda';
import {lambdaClient} from '../shared/aws-clients';
import {RENDER_FN_PREFIX} from '../shared/constants';

export const getDeployedLambdas = async () => {
	const lambdas = await lambdaClient.send(new ListFunctionsCommand({}));

	const remotionLambdas = (lambdas.Functions || []).filter((f) => {
		return f.FunctionName?.startsWith(RENDER_FN_PREFIX);
	});

	return remotionLambdas;
};
