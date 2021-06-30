import {ListFunctionsCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';
import {RENDER_FN_PREFIX} from '../shared/constants';

// TODO: Should assert string
export const getDeployedLambdas = async (options: {region: AwsRegion}) => {
	const lambdas = await getLambdaClient(options.region).send(
		new ListFunctionsCommand({})
	);

	const remotionLambdas = (lambdas.Functions || []).filter((f) => {
		return f.FunctionName?.startsWith(RENDER_FN_PREFIX);
	});

	return remotionLambdas;
};
