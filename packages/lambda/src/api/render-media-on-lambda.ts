import type {
	ChromiumOptions,
	FrameRange,
	ImageFormat,
	LogLevel,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import type {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import type {OutNameInput, Privacy} from '../shared/constants';
import {LambdaRoutines} from '../shared/constants';
import type {DownloadBehavior} from '../shared/content-disposition-header';
import {convertToServeUrl} from '../shared/convert-to-serve-url';
import {validateDownloadBehavior} from '../shared/validate-download-behavior';
import {validateFramesPerLambda} from '../shared/validate-frames-per-lambda';
import type {LambdaCodec} from '../shared/validate-lambda-codec';
import {validateLambdaCodec} from '../shared/validate-lambda-codec';
import {validateServeUrl} from '../shared/validate-serveurl';

export type RenderMediaOnLambdaInput = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps: unknown;
	codec: LambdaCodec;
	imageFormat: ImageFormat;
	crf?: number | undefined;
	envVariables?: Record<string, string>;
	pixelFormat?: PixelFormat;
	proResProfile?: ProResProfile;
	privacy: Privacy;
	quality?: number;
	maxRetries: number;
	framesPerLambda?: number;
	logLevel?: LogLevel;
	frameRange?: FrameRange;
	outName?: OutNameInput;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	everyNthFrame?: number;
	numberOfGifLoops?: number | null;
	concurrencyPerLambda?: number;
	downloadBehavior?: DownloadBehavior | null;
	muted?: boolean;
};

export type RenderMediaOnLambdaOutput = {
	renderId: string;
	bucketName: string;
};

/**
 * @description Triggers a render on a lambda given a composition and a lambda function.
 * @link https://remotion.dev/docs/lambda/rendermediaonlambda
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
 * @param params.logLevel Level of logging that Lambda function should perform. Default "info".
 * @returns {Promise<RenderMediaOnLambdaOutput>} See documentation for detailed structure
 */

export const renderMediaOnLambda = async ({
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
	framesPerLambda,
	privacy,
	logLevel,
	frameRange,
	outName,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	numberOfGifLoops,
	everyNthFrame,
	concurrencyPerLambda,
	downloadBehavior,
	muted,
}: RenderMediaOnLambdaInput): Promise<RenderMediaOnLambdaOutput> => {
	const actualCodec = validateLambdaCodec(codec);
	validateServeUrl(serveUrl);
	validateFramesPerLambda(framesPerLambda ?? null);
	validateDownloadBehavior(downloadBehavior);
	const realServeUrl = await convertToServeUrl(serveUrl, region);
	try {
		const res = await callLambda({
			functionName,
			type: LambdaRoutines.start,
			payload: {
				framesPerLambda: framesPerLambda ?? null,
				composition,
				serveUrl: realServeUrl,
				inputProps,
				codec: actualCodec,
				imageFormat,
				crf,
				envVariables,
				pixelFormat,
				proResProfile,
				quality,
				maxRetries,
				privacy,
				logLevel: logLevel ?? 'info',
				frameRange: frameRange ?? null,
				outName: outName ?? null,
				timeoutInMilliseconds: timeoutInMilliseconds ?? 30000,
				chromiumOptions: chromiumOptions ?? {},
				scale: scale ?? 1,
				everyNthFrame: everyNthFrame ?? 1,
				numberOfGifLoops: numberOfGifLoops ?? 0,
				concurrencyPerLambda: concurrencyPerLambda ?? 1,
				downloadBehavior: downloadBehavior ?? {type: 'play-in-browser'},
				muted: muted ?? false,
			},
			region,
		});
		return {
			renderId: res.renderId,
			bucketName: res.bucketName,
		};
	} catch (err) {
		if ((err as Error).stack?.includes('UnrecognizedClientException')) {
			throw new Error(
				'UnrecognizedClientException: The AWS credentials provided were probably mixed up. Learn how to fix this issue here: https://remotion.dev/docs/lambda/troubleshooting/unrecognizedclientexception'
			);
		}

		throw err;
	}
};

/**
 * @deprecated Renamed to renderMediaOnLambda()
 */
export const renderVideoOnLambda = renderMediaOnLambda;
