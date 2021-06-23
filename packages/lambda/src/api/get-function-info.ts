import {GetFunctionCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {getFunctionVersion} from './get-function-version';

export const getFunctionInfo = async ({
	region,
	functionName,
}: {
	region: AwsRegion;
	functionName: string;
}) => {
	validateAwsRegion(region);

	const [functionInfo, version] = await Promise.all([
		getLambdaClient(region).send(
			new GetFunctionCommand({
				FunctionName: functionName,
			})
		),
		getFunctionVersion({
			functionName,
			region,
		}),
	]);

	return {
		functionName,
		timeout: functionInfo.Configuration?.Timeout as number,
		memorySize: functionInfo.Configuration?.MemorySize as number,
		version,
	};
};
