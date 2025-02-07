import {DeleteFunctionCommand} from '@aws-sdk/client-lambda';
import type {
	DeleteFunction,
	DeleteFunctionInput as GenericDeleteFunctionInput,
} from '@remotion/serverless-client';
import {getLambdaClient} from './aws-clients';
import type {AwsProvider} from './aws-provider';

export type DeleteFunctionInput = GenericDeleteFunctionInput<AwsProvider>;

/*
 * @description Deletes a deployed Lambda function based on its name.
 * @see [Documentation](https://remotion.dev/docs/lambda/deletefunction)
 */
export const deleteFunction: DeleteFunction<AwsProvider> = async ({
	region,
	functionName,
}: DeleteFunctionInput): Promise<void> => {
	await getLambdaClient(region).send(
		new DeleteFunctionCommand({
			FunctionName: functionName,
		}),
	);
};
