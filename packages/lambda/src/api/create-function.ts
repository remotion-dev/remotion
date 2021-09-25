import {CreateFunctionCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '..';
import {getLambdaClient} from '../shared/aws-clients';

export const createFunction = async ({
	region,
	functionName,
	accountId,
	memorySizeInMb,
	timeoutInSeconds,
}: {
	region: AwsRegion;
	functionName: string;
	accountId: string;
	memorySizeInMb: number;
	timeoutInSeconds: number;
}) => {
	const {FunctionName} = await getLambdaClient(region).send(
		new CreateFunctionCommand({
			Code: {
				ImageUri:
					'976210361945.dkr.ecr.eu-central-1.amazonaws.com/lambda-base-image:v1',
			},
			FunctionName: functionName,
			// TODO: Give helpful suggestion if user did not create role
			Role: `arn:aws:iam::${accountId}:role/remotion-lambda-role`,
			Description: 'Renders a Remotion video.',
			PackageType: 'Image',
			MemorySize: memorySizeInMb,
			Timeout: timeoutInSeconds,
		})
	);
	return {FunctionName};
};
