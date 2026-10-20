import type {LogLevel} from '@remotion/renderer';
import {callFunctionSyncImplementation} from './call-lambda-sync';
import type {RenderProgress} from './constants';
import {getRenderProgressPayload} from './make-lambda-payload';
import {parseFunctionName} from './parse-function-name';
import {getProgress} from './progress';
import type {AwsRegion} from './regions';
import {ServerlessRoutines, type CustomCredentials} from './shared-constants';
import type {RequestHandler} from './types';

export type GetRenderProgressInput = {
	functionName: string;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	logLevel?: LogLevel;
	s3OutputProvider?: CustomCredentials;
	forcePathStyle?: boolean;
	skipLambdaInvocation?: boolean;
	requestHandler?: RequestHandler;
};

/*
 * @description Gets the current status of a render triggered via renderMediaOnLambda() or renderFramesOnLambda().
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

		return getProgress({
			bucketName: input.bucketName,
			renderId: input.renderId,
			region: input.region,
			forcePathStyle: input.forcePathStyle ?? false,
			customCredentials: input.s3OutputProvider ?? null,
			expectedBucketOwner: null,
			memorySizeInMb: parsed.memorySizeInMb,
			timeoutInMilliseconds: parsed.timeoutInSeconds * 1000,
			functionName: input.functionName,
			requestHandler: input.requestHandler,
		});
	}

	const result =
		await callFunctionSyncImplementation<ServerlessRoutines.status>({
			functionName: input.functionName,
			type: ServerlessRoutines.status,
			payload: getRenderProgressPayload(input),
			region: input.region,
			timeoutInTest: 120000,
			requestHandler: input.requestHandler,
		});
	return {...result, separateAudio: result.separateAudio ?? null};
};
