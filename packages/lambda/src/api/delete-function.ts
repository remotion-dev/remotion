import {DeleteFunctionCommand} from '@aws-sdk/client-lambda';
import type {
	DeleteFunction,
	DeleteFunctionInput as GenericDeleteFunctionInput,
} from '@remotion/serverless';
import type {AwsProvider} from '../functions/aws-implementation';
import {getLambdaClient} from '../shared/aws-clients';

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
