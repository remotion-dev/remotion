import {DeleteFunctionCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';

export const deleteFunction = async ({
	region,
	functionName,
}: {
	region: AwsRegion;
	functionName: string;
}): Promise<void> => {
	await getLambdaClient(region).send(
		new DeleteFunctionCommand({
			FunctionName: functionName,
		})
	);
};
