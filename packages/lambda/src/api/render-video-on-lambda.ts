import {Codec, ImageFormat, PixelFormat, ProResProfile} from 'remotion';
import {parsedLambdaCli} from '../cli/args';
import {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

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
}: {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	inputProps: unknown;
	codec: Codec;
	imageFormat: ImageFormat;
	crf?: number | undefined;
	envVariables?: Record<string, string>;
	pixelFormat?: PixelFormat;
	proResProfile?: ProResProfile;
	quality?: number;
}) => {
	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			// TODO: Allow to parametrize
			chunkSize: 20,
			composition: parsedLambdaCli._[2],
			serveUrl,
			inputProps,
			codec,
			imageFormat,
			crf,
			envVariables,
			pixelFormat,
			proResProfile,
			quality,
		},
		region,
	});
	return {
		renderId: res.renderId,
		bucketName: res.bucketName,
	};
};
