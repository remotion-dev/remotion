import type {
	AudioCodec,
	BrowserSafeApis,
	ChromiumOptions,
	DownloadBehavior,
	FrameRange,
	OutNameInput,
	PixelFormat,
	Privacy,
	ProResProfile,
	ServerlessCodec,
	ToOptions,
	VideoImageFormat,
	WebhookOption,
} from '@remotion/serverless-client';
import {
	ServerlessRoutines,
	wrapWithErrorHandling,
} from '@remotion/serverless-client';
import {awsImplementation, type AwsProvider} from './aws-provider';
import {
	getCloudwatchMethodUrl,
	getCloudwatchRendererUrl,
	getLambdaInsightsUrl,
	getProgressJsonUrl,
	getS3RenderUrl,
} from './get-aws-urls';
import type {InnerRenderMediaOnLambdaInput} from './make-lambda-payload';
import {makeLambdaRenderMediaPayload} from './make-lambda-payload';
import type {AwsRegion} from './regions';

export type RenderMediaOnLambdaInput = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps?: Record<string, unknown>;
	codec: ServerlessCodec;
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
	outName?: OutNameInput<AwsProvider>;
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
	forcePathStyle?: boolean;
	metadata?: Record<string, string> | null;
} & Partial<ToOptions<typeof BrowserSafeApis.optionsMap.renderMediaOnLambda>>;

export type RenderMediaOnLambdaOutput = {
	renderId: string;
	bucketName: string;
	cloudWatchLogs: string;
	cloudWatchMainLogs: string;
	lambdaInsightsLogs: string;
	folderInS3Console: string;
	progressJsonInConsole: string;
};

export const internalRenderMediaOnLambdaRaw = async (
	input: InnerRenderMediaOnLambdaInput,
): Promise<RenderMediaOnLambdaOutput> => {
	const {functionName, region, rendererFunctionName} = input;

	try {
		const res = await awsImplementation.callFunctionSync({
			functionName,
			type: ServerlessRoutines.start,
			payload: await makeLambdaRenderMediaPayload(input),
			region,
			timeoutInTest: 120000,
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
			cloudWatchMainLogs: getCloudwatchMethodUrl({
				renderId: res.renderId,
				functionName,
				method: ServerlessRoutines.launch,
				region,
				rendererFunctionName: rendererFunctionName ?? null,
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
			progressJsonInConsole: getProgressJsonUrl({
				bucketName: res.bucketName,
				renderId: res.renderId,
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

export const renderMediaOnLambdaOptionalToRequired = (
	options: RenderMediaOnLambdaInput,
): InnerRenderMediaOnLambdaInput => {
	return {
		offthreadVideoThreads: options.offthreadVideoThreads ?? null,
		audioBitrate: options.audioBitrate ?? null,
		audioCodec: options.audioCodec ?? null,
		chromiumOptions: options.chromiumOptions ?? {},
		codec: options.codec,
		colorSpace: options.colorSpace ?? null,
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
		preferLossless: options.preferLossless ?? false,
		forcePathStyle: options.forcePathStyle ?? false,
		indent: false,
		metadata: options.metadata ?? null,
		apiKey: options.apiKey ?? null,
	};
};

const wrapped = wrapWithErrorHandling(internalRenderMediaOnLambdaRaw);

/*
 * @description Kicks off a render process on Remotion Lambda. The progress can be tracked using getRenderProgress().
 * @see [Documentation](https://remotion.dev/docs/lambda/rendermediaonlambda)
 */
export const renderMediaOnLambda = (
	options: RenderMediaOnLambdaInput,
): Promise<RenderMediaOnLambdaOutput> => {
	if (options.quality) {
		throw new Error(
			'quality has been renamed to jpegQuality. Please rename the option.',
		);
	}

	return wrapped(renderMediaOnLambdaOptionalToRequired(options));
};

/**
 * @deprecated Renamed to renderMediaOnLambda()
 */
export const renderVideoOnLambda = renderMediaOnLambda;
