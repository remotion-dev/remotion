import {ListFunctionsCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';
import {CURRENT_VERSION, RENDER_FN_PREFIX} from '../shared/constants';
import {getFunctionVersion} from '../shared/get-function-version';

// TODO: Compatible only
export const getFunctions = async (options: {
	region: AwsRegion;
	compatibleOnly: boolean;
}) => {
	const lambdas = await getLambdaClient(options.region).send(
		new ListFunctionsCommand({})
	);

	const remotionLambdas = (lambdas.Functions || []).filter((f) => {
		return f.FunctionName?.startsWith(RENDER_FN_PREFIX);
	});

	const configs = await Promise.all(
		remotionLambdas.map((fn) => {
			return getFunctionVersion({
				functionName: fn.FunctionName as string,
				region: options.region,
			});
		})
	);

	const list = remotionLambdas.map((lambda, i) => {
		return {
			name: lambda.FunctionName as string,
			version: configs[i],
			memory: lambda.MemorySize as number,
			timeout: lambda.Timeout as number,
		};
	});
	if (!options.compatibleOnly) {
		return list;
	}

	return list.filter((l) => {
		if (!options.compatibleOnly) {
			return true;
		}

		return l.version === CURRENT_VERSION;
	});
};
