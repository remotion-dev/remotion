import {DeleteFunctionCommand} from '@aws-sdk/client-lambda';
import type {AwsRegion} from '../regions';
import {getLambdaClient} from '../shared/aws-clients';

export type DeleteFunctionInput = {
	region: AwsRegion;
	functionName: string;
};

/*
 * @description Deletes a deployed Lambda function based on its name.
 * @see [Documentation](https://remotion.dev/docs/lambda/deletefunction)
 */
export const deleteFunction = async ({
	region,
	functionName,
}: DeleteFunctionInput): Promise<void> => {
	await getLambdaClient(region).send(
		new DeleteFunctionCommand({
			FunctionName: functionName,
		}),
	);
};
