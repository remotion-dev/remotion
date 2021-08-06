import {ImageFormat, PixelFormat, ProResProfile} from 'remotion';
import {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

// TODO: `privacy` field
/**
 * @description Triggers a render on a lambda given a composition and a lambda function.
 * @link https://remotion.dev/docs/lambda/rendervideoonlambda
 * @param params.functionName The name of the Lambda function that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.codec The video codec which should be used for encoding.
 * @param params.imageFormat In which image format the frames should be rendered.
 * @param params.crf The constant rate factor to be used during encoding.
 * @param params.envVariables Object containing environment variables to be inserted into the video environment
 * @param params.proResProfile The ProRes profile if rendering a ProRes video
 * @param params.quality JPEG quality if JPEG was selected as the image format.
 * @param params.region The AWS region in which the video should be rendered.
 * @param params.maxRetries How often rendering a chunk may fail before the video render gets aborted.
 * @returns `Promise<{renderId: string; bucketName: string}>`
 */

export const renderVideoOnLambda = async ({
	functionName,
	serveUrl,
	inputProps,
	codec,
	imageFormat,
	crf,
	envVariables,
	pixelFormat,
	proResProfile,
	quality,
	region,
	maxRetries,
	composition,
}: {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps: unknown;
	codec: 'h264-mkv' | 'mp3' | 'aac' | 'wav';
	imageFormat: ImageFormat;
	crf?: number | undefined;
	envVariables?: Record<string, string>;
	pixelFormat?: PixelFormat;
	proResProfile?: ProResProfile;
	quality?: number;
	maxRetries: number;
}) => {
	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			// TODO: Allow to parametrize
			chunkSize: 20,
			composition,
			serveUrl,
			inputProps,
			codec,
			imageFormat,
			crf,
			envVariables,
			pixelFormat,
			proResProfile,
			quality,
			maxRetries,
		},
		region,
	});
	return {
		renderId: res.renderId,
		bucketName: res.bucketName,
	};
};
