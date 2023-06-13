import type {AwsRegion} from '../pricing/aws-regions';
import type {CustomCredentials} from '../shared/aws-clients';
import {callLambda} from '../shared/call-lambda';
import type {RenderProgress} from '../shared/constants';
import {LambdaRoutines} from '../shared/constants';
import {getRenderProgressPayload} from './make-lambda-payload';

export type GetRenderInput = {
	functionName: string;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
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
	input: GetRenderInput
): Promise<RenderProgress> => {
	const result = await callLambda({
		functionName: input.functionName,
		type: LambdaRoutines.status,
		payload: getRenderProgressPayload(input),
		region: input.region,
	});
	return result;
};
