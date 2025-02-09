import type {CustomCredentials, LogLevel} from '@remotion/serverless-client';
import {getProgress, ServerlessRoutines} from '@remotion/serverless-client';
import {awsImplementation, type AwsProvider} from './aws-provider';
import type {RenderProgress} from './constants';
import {getRenderProgressPayload} from './make-lambda-payload';
import {parseFunctionName} from './parse-function-name';
import type {AwsRegion} from './regions';

export type GetRenderProgressInput = {
	functionName: string;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	logLevel?: LogLevel;
	s3OutputProvider?: CustomCredentials<AwsProvider>;
	forcePathStyle?: boolean;
	skipLambdaInvocation?: boolean;
};

/*
 * @description Gets the current status of a render originally triggered via renderMediaOnLambda().
 * @see [Documentation](https://remotion.dev/docs/lambda/getrenderprogress)
 */
export const getRenderProgress = async (
	input: GetRenderProgressInput,
): Promise<RenderProgress> => {
	if (input.skipLambdaInvocation) {
		const parsed = parseFunctionName(input.functionName);
		if (!parsed) {
			throw new Error(
				[
					`The function name ${input.functionName} does not adhere to the function name convention (https://www.remotion.dev/docs/lambda/naming-convention).`,
					'Cannot determine memory and disk size from the function name.',
					'You must call getRenderProgress with `skipLambdaInvocation` set to false.',
				].join('\n'),
			);
		}

		return getProgress<AwsProvider>({
			bucketName: input.bucketName,
			renderId: input.renderId,
			region: input.region,
			forcePathStyle: input.forcePathStyle ?? false,
			customCredentials: input.s3OutputProvider ?? null,
			expectedBucketOwner: null,
			providerSpecifics: awsImplementation,
			memorySizeInMb: parsed.memorySizeInMb,
			timeoutInMilliseconds: parsed.timeoutInSeconds * 1000,
			functionName: input.functionName,
		});
	}

	const result =
		await awsImplementation.callFunctionSync<ServerlessRoutines.status>({
			functionName: input.functionName,
			type: ServerlessRoutines.status,
			payload: getRenderProgressPayload(input),
			region: input.region,
			timeoutInTest: 120000,
		});
	return result;
};
