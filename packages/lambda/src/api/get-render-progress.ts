import type {LogLevel} from '@remotion/renderer';
import type {CustomCredentials} from '@remotion/serverless/client';
import {ServerlessRoutines} from '@remotion/serverless/client';
import {
	awsImplementation,
	type AwsProvider,
} from '../functions/aws-implementation';
import {getProgress} from '../functions/helpers/get-progress';
import {parseFunctionName} from '../functions/helpers/parse-function-name';
import type {AwsRegion} from '../regions';
import {callLambda} from '../shared/call-lambda';
import type {RenderProgress} from '../shared/constants';
import {getRenderProgressPayload} from './make-lambda-payload';

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

/**
 * @description Gets the current status of a render originally triggered via renderMediaOnLambda().
 * @see [Documentation](https://remotion.dev/docs/lambda/getrenderprogress)
 * @param {string} params.functionName The name of the function used to trigger the render.
 * @param {string} params.bucketName The name of the bucket that was used in the render.
 * @param {string} params.renderId The ID of the render that was returned by `renderMediaOnLambda()`.
 * @param {AwsRegion} params.region The region in which the render was triggered.
 * @param {CustomCredentials} params.s3OutputProvider? Endpoint and credentials if the output file is stored outside of AWS.
 * @returns {Promise<RenderProgress>} See documentation for this function to see all properties on the return object.
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
		});
	}

	const result = await callLambda<AwsProvider, ServerlessRoutines.status>({
		functionName: input.functionName,
		type: ServerlessRoutines.status,
		payload: getRenderProgressPayload(input),
		region: input.region,
		timeoutInTest: 120000,
	});
	return result;
};
