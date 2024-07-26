import type {LogLevel} from '@remotion/renderer';
import type {AwsRegion, CustomCredentials} from '@remotion/serverless/client';
import {ServerlessRoutines} from '@remotion/serverless/client';
import {callLambda} from '../shared/call-lambda';
import type {RenderProgress} from '../shared/constants';
import {getRenderProgressPayload} from './make-lambda-payload';

export type GetRenderProgressInput = {
	functionName: string;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	logLevel?: LogLevel;
	s3OutputProvider?: CustomCredentials;
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
	const result = await callLambda({
		functionName: input.functionName,
		type: ServerlessRoutines.status,
		payload: getRenderProgressPayload(input),
		region: input.region,
		timeoutInTest: 120000,
	});
	return result;
};
