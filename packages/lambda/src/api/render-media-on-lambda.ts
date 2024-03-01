import type {
	AudioCodec,
	ChromiumOptions,
	FrameRange,
	PixelFormat,
	ProResProfile,
	ToOptions,
	VideoImageFormat,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import type {OutNameInput, Privacy, WebhookOption} from '../shared/constants';
import {LambdaRoutines} from '../shared/constants';
import type {DownloadBehavior} from '../shared/content-disposition-header';
import {
	getCloudwatchRendererUrl,
	getLambdaInsightsUrl,
	getS3RenderUrl,
} from '../shared/get-aws-urls';
import type {LambdaCodec} from '../shared/validate-lambda-codec';
import type {InnerRenderMediaOnLambdaInput} from './make-lambda-payload';
import {makeLambdaRenderMediaPayload} from './make-lambda-payload';

export type RenderMediaOnLambdaInput = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps?: Record<string, unknown>;
	codec: LambdaCodec;
	imageFormat?: VideoImageFormat;
	crf?: number | undefined;
	envVariables?: Record<string, string>;
	pixelFormat?: PixelFormat;
	proResProfile?: ProResProfile;
	privacy?: Privacy;
	/**
	 * @deprecated Renamed to `jpegQuality`
	 */
	quality?: never;
	jpegQuality?: number;
	maxRetries?: number;
	framesPerLambda?: number;
	frameRange?: FrameRange;
	outName?: OutNameInput;
	chromiumOptions?: Omit<ChromiumOptions, 'enableMultiProcessOnLinux'>;
	scale?: number;
	everyNthFrame?: number;
	concurrencyPerLambda?: number;
	downloadBehavior?: DownloadBehavior | null;
	overwrite?: boolean;
	webhook?: WebhookOption | null;
	forceWidth?: number | null;
	forceHeight?: number | null;
	rendererFunctionName?: string | null;
	forceBucketName?: string;
	audioCodec?: AudioCodec | null;
	/**
	 * @deprecated in favor of `logLevel`: true
	 */
	dumpBrowserLogs?: boolean;
} & Partial<ToOptions<typeof BrowserSafeApis.optionsMap.renderMediaOnLambda>>;

export type RenderMediaOnLambdaOutput = {
	renderId: string;
	bucketName: string;
	cloudWatchLogs: string;
	lambdaInsightsLogs: string;
	folderInS3Console: string;
};

export const internalRenderMediaOnLambdaRaw = async (
	input: InnerRenderMediaOnLambdaInput,
): Promise<RenderMediaOnLambdaOutput> => {
	const {functionName, region, rendererFunctionName} = input;

	try {
		const res = await callLambda({
			functionName,
			type: LambdaRoutines.start,
			payload: await makeLambdaRenderMediaPayload(input),
			region,
			receivedStreamingPayload: () => undefined,
			timeoutInTest: 120000,
			retriesRemaining: 0,
		});

		return {
			renderId: res.renderId,
			bucketName: res.bucketName,
			cloudWatchLogs: getCloudwatchRendererUrl({
				functionName,
				region,
				renderId: res.renderId,
				rendererFunctionName: rendererFunctionName ?? null,
				chunk: null,
			}),
			folderInS3Console: getS3RenderUrl({
				bucketName: res.bucketName,
				renderId: res.renderId,
				region,
			}),
			lambdaInsightsLogs: getLambdaInsightsUrl({
				functionName,
				region,
			}),
		};
	} catch (err) {
		if ((err as Error).stack?.includes('UnrecognizedClientException')) {
			throw new Error(
				'UnrecognizedClientException: The AWS credentials provided were probably mixed up. Learn how to fix this issue here: https://remotion.dev/docs/lambda/troubleshooting/unrecognizedclientexception',
			);
		}

		throw err;
	}
};

/**
 * @description Triggers a render on a lambda given a composition and a lambda function.
 * @see [Documentation](https://remotion.dev/docs/lambda/rendermediaonlambda)
 * @param params.functionName The name of the Lambda function that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.codec The media codec which should be used for encoding.
 * @param params.imageFormat In which image format the frames should be rendered. Default "jpeg"
 * @param params.crf The constant rate factor to be used during encoding.
 * @param params.envVariables Object containing environment variables to be inserted into the video environment
 * @param params.proResProfile The ProRes profile if rendering a ProRes video
 * @param params.jpegQuality JPEG quality if JPEG was selected as the image format.
 * @param params.region The AWS region in which the media should be rendered.
 * @param params.maxRetries How often rendering a chunk may fail before the media render gets aborted. Default "1"
 * @param params.logLevel Level of logging that Lambda function should perform. Default "info".
 * @param params.webhook Configuration for webhook called upon completion or timeout of the render.
 * @returns {Promise<RenderMediaOnLambdaOutput>} See documentation for detailed structure
 */
export const renderMediaOnLambda = (
	options: RenderMediaOnLambdaInput,
): Promise<RenderMediaOnLambdaOutput> => {
	const wrapped = NoReactAPIs.wrapWithErrorHandling(
		internalRenderMediaOnLambdaRaw,
	);
	if (options.quality) {
		throw new Error(
			'quality has been renamed to jpegQuality. Please rename the option.',
		);
	}

	return wrapped({
		audioBitrate: options.audioBitrate ?? null,
		audioCodec: options.audioCodec ?? null,
		chromiumOptions: options.chromiumOptions ?? {},
		codec: options.codec,
		colorSpace: options.colorSpace ?? 'default',
		composition: options.composition,
		concurrencyPerLambda: options.concurrencyPerLambda ?? 1,
		crf: options.crf,
		downloadBehavior: options.downloadBehavior ?? {type: 'play-in-browser'},
		envVariables: options.envVariables ?? {},
		everyNthFrame: options.everyNthFrame ?? 1,
		forceBucketName: options.forceBucketName ?? null,
		forceHeight: options.forceHeight ?? null,
		forceWidth: options.forceWidth ?? null,
		frameRange: options.frameRange ?? null,
		framesPerLambda: options.framesPerLambda ?? null,
		functionName: options.functionName,
		imageFormat: options.imageFormat ?? 'jpeg',
		inputProps: options.inputProps ?? {},
		jpegQuality: options.jpegQuality ?? 80,
		logLevel: options.logLevel ?? 'info',
		maxRetries: options.maxRetries ?? 1,
		muted: options.muted ?? false,
		numberOfGifLoops: options.numberOfGifLoops ?? null,
		offthreadVideoCacheSizeInBytes:
			options.offthreadVideoCacheSizeInBytes ?? null,
		outName: options.outName ?? null,
		overwrite: options.overwrite ?? false,
		pixelFormat: options.pixelFormat ?? undefined,
		privacy: options.privacy ?? 'public',
		proResProfile: options.proResProfile ?? undefined,
		region: options.region,
		rendererFunctionName: options.rendererFunctionName ?? null,
		scale: options.scale ?? 1,
		serveUrl: options.serveUrl,
		timeoutInMilliseconds: options.timeoutInMilliseconds ?? 30000,
		videoBitrate: options.videoBitrate ?? null,
		encodingMaxRate: options.encodingMaxRate ?? null,
		encodingBufferSize: options.encodingBufferSize ?? null,
		webhook: options.webhook ?? null,
		x264Preset: options.x264Preset ?? null,
		deleteAfter: options.deleteAfter ?? null,
	});
};

/**
 * @deprecated Renamed to renderMediaOnLambda()
 */
export const renderVideoOnLambda = renderMediaOnLambda;
