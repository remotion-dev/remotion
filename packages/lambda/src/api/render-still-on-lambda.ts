import {LogLevel, StillImageFormat} from 'remotion';
import {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import {
	CostsInfo,
	DEFAULT_MAX_RETRIES,
	LambdaRoutines,
} from '../shared/constants';
import {convertToServeUrl} from '../shared/convert-to-serve-url';

export type RenderStillOnLambdaInput = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps: unknown;
	imageFormat: StillImageFormat;
	privacy: 'private' | 'public';
	maxRetries?: number;
	envVariables?: Record<string, string>;
	quality?: number;
	frame?: number;
	logLevel?: LogLevel;
	outName?: string;
};

export type RenderStillOnLambdaOutput = {
	estimatedPrice: CostsInfo;
	url: string;
	sizeInBytes: number;
	bucketName: string;
	renderId: string;
};

/**
 * @description Renders a still frame on Lambda
 * @link https://v3.remotion.dev/docs/lambda/renderstillonlambda
 * @param params.functionName The name of the Lambda function that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.imageFormat In which image format the frames should be rendered.
 * @param params.envVariables Object containing environment variables to be inserted into the video environment
 * @param params.quality JPEG quality if JPEG was selected as the image format.
 * @param params.region The AWS region in which the video should be rendered.
 * @param params.maxRetries How often rendering a chunk may fail before the video render gets aborted.
 * @param params.frame Which frame should be used for the still image. Default 0.
 * @param params.privacy Whether the item in the S3 bucket should be public. Possible values: `"private"` and `"public"`
 * @returns {Promise<RenderStillOnLambdaOutput>} See documentation for exact response structure.
 */

export const renderStillOnLambda = async ({
	functionName,
	serveUrl,
	inputProps,
	imageFormat,
	envVariables,
	quality,
	region,
	maxRetries,
	composition,
	privacy,
	frame,
	logLevel,
	outName,
}: RenderStillOnLambdaInput): Promise<RenderStillOnLambdaOutput> => {
	const realServeUrl = await convertToServeUrl(serveUrl, region);

	const res = await callLambda({
		functionName,
		type: LambdaRoutines.still,
		payload: {
			composition,
			serveUrl: realServeUrl,
			inputProps,
			imageFormat,
			envVariables,
			quality,
			maxRetries: maxRetries ?? DEFAULT_MAX_RETRIES,
			frame: frame ?? 0,
			privacy,
			attempt: 1,
			logLevel,
			outName: outName ?? null,
		},
		region,
	});
	return {
		estimatedPrice: res.estimatedPrice,
		url: res.output,
		sizeInBytes: res.size,
		bucketName: res.bucketName,
		renderId: res.renderId,
	};
};
