import type {
	AudioCodec,
	BrowserSafeApis,
	ChromiumOptions,
	ColorSpace,
	DeleteAfter,
	DownloadBehavior,
	FrameRange,
	LogLevel,
	OutNameInput,
	PixelFormat,
	Privacy,
	ProResProfile,
	ServerlessCodec,
	ServerlessPayloads,
	ServerlessStartPayload,
	ServerlessStatusPayload,
	ToOptions,
	VideoImageFormat,
	WebhookOption,
	X264Preset,
} from '@remotion/serverless-client';
import {
	ENABLE_V5_BREAKING_CHANGES,
	ServerlessRoutines,
	VERSION,
	compressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
	validateDownloadBehavior,
	validateFramesPerFunction,
} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {awsImplementation} from './aws-provider';

import {validateWebhook} from '@remotion/serverless-client';
import type {GetRenderProgressInput} from './get-render-progress';
import type {AwsRegion} from './regions';
import type {RenderStillOnLambdaNonNullInput} from './render-still-on-lambda';
import {validateLambdaCodec} from './validate-lambda-codec';
import {validateServeUrl} from './validate-serveurl';

export type InnerRenderMediaOnLambdaInput = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps: Record<string, unknown>;
	codec: ServerlessCodec;
	imageFormat: VideoImageFormat;
	crf: number | undefined;
	envVariables: Record<string, string>;
	pixelFormat: PixelFormat | undefined;
	proResProfile: ProResProfile | undefined;
	x264Preset: X264Preset | null;
	privacy: Privacy;
	jpegQuality: number;
	maxRetries: number;
	framesPerLambda: number | null;
	logLevel: LogLevel;
	frameRange: FrameRange | null;
	outName: OutNameInput<AwsProvider> | null;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	scale: number;
	everyNthFrame: number;
	numberOfGifLoops: number | null;
	concurrencyPerLambda: number;
	downloadBehavior: DownloadBehavior;
	muted: boolean;
	overwrite: boolean;
	audioBitrate: string | null;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	webhook: WebhookOption | null;
	forceWidth: number | null;
	forceHeight: number | null;
	rendererFunctionName: string | null;
	forceBucketName: string | null;
	audioCodec: AudioCodec | null;
	colorSpace: ColorSpace | null;
	deleteAfter: DeleteAfter | null;
	indent: boolean;
	forcePathStyle: boolean;
	metadata: Record<string, string> | null;
} & ToOptions<typeof BrowserSafeApis.optionsMap.renderMediaOnLambda>;

export const makeLambdaRenderMediaPayload = async ({
	rendererFunctionName,
	frameRange,
	framesPerLambda,
	forceBucketName: bucketName,
	codec,
	composition,
	serveUrl,
	imageFormat,
	inputProps,
	region,
	crf,
	envVariables,
	pixelFormat,
	proResProfile,
	x264Preset,
	maxRetries,
	privacy,
	logLevel,
	outName,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	everyNthFrame,
	numberOfGifLoops,
	audioBitrate,
	concurrencyPerLambda,
	audioCodec,
	forceHeight,
	forceWidth,
	webhook,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	downloadBehavior,
	muted,
	overwrite,
	jpegQuality,
	offthreadVideoCacheSizeInBytes,
	deleteAfter,
	colorSpace,
	preferLossless,
	forcePathStyle,
	metadata,
	apiKey,
	offthreadVideoThreads,
}: InnerRenderMediaOnLambdaInput): Promise<
	ServerlessStartPayload<AwsProvider>
> => {
	const actualCodec = validateLambdaCodec(codec);
	validateServeUrl(serveUrl);
	validateFramesPerFunction({
		framesPerFunction: framesPerLambda ?? null,
		durationInFrames: 1,
	});
	validateDownloadBehavior(downloadBehavior);
	validateWebhook(webhook);

	const stringifiedInputProps = serializeOrThrow(
		inputProps ?? {},
		'input-props',
	);

	const serialized = await compressInputProps({
		stringifiedInputProps,
		region,
		needsToUpload: getNeedsToUpload({
			type: 'video-or-audio',
			sizes: [
				stringifiedInputProps.length,
				JSON.stringify(envVariables).length,
			],
			providerSpecifics: awsImplementation,
		}),
		userSpecifiedBucketName: bucketName ?? null,
		propsType: 'input-props',
		providerSpecifics: awsImplementation,
		forcePathStyle: forcePathStyle ?? false,
		skipPutAcl: privacy === 'no-acl',
	});
	return {
		rendererFunctionName,
		framesPerLambda,
		composition,
		serveUrl,
		inputProps: serialized,
		codec: actualCodec,
		imageFormat,
		crf: crf ?? null,
		envVariables,
		pixelFormat: pixelFormat ?? null,
		proResProfile: proResProfile ?? null,
		x264Preset,
		jpegQuality,
		maxRetries,
		privacy,
		logLevel,
		frameRange,
		outName,
		timeoutInMilliseconds,
		chromiumOptions,
		scale,
		everyNthFrame,
		numberOfGifLoops,
		concurrencyPerLambda,
		downloadBehavior,
		muted,
		version: VERSION,
		overwrite: overwrite ?? ENABLE_V5_BREAKING_CHANGES,
		audioBitrate: audioBitrate ?? null,
		videoBitrate: videoBitrate ?? null,
		encodingBufferSize: encodingBufferSize ?? null,
		encodingMaxRate: encodingMaxRate ?? null,
		webhook: webhook ?? null,
		forceHeight: forceHeight ?? null,
		forceWidth: forceWidth ?? null,
		bucketName: bucketName ?? null,
		audioCodec: audioCodec ?? null,
		type: ServerlessRoutines.start,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		deleteAfter: deleteAfter ?? null,
		colorSpace: colorSpace ?? null,
		preferLossless: preferLossless ?? false,
		forcePathStyle: forcePathStyle ?? false,
		metadata: metadata ?? null,
		apiKey: apiKey ?? null,
		offthreadVideoThreads: offthreadVideoThreads ?? null,
	};
};

export const getRenderProgressPayload = ({
	bucketName,
	renderId,
	s3OutputProvider,
	logLevel,
	forcePathStyle,
}: GetRenderProgressInput): ServerlessStatusPayload<AwsProvider> => {
	return {
		type: ServerlessRoutines.status,
		bucketName,
		renderId,
		version: VERSION,
		s3OutputProvider: s3OutputProvider ?? null,
		logLevel: logLevel ?? 'info',
		forcePathStyle: forcePathStyle ?? false,
	};
};

export const makeLambdaRenderStillPayload = async ({
	serveUrl,
	inputProps,
	imageFormat,
	envVariables,
	quality,
	jpegQuality,
	region,
	maxRetries,
	composition,
	privacy,
	frame,
	logLevel,
	outName,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	downloadBehavior,
	forceHeight,
	forceWidth,
	forceBucketName,
	offthreadVideoCacheSizeInBytes,
	deleteAfter,
	forcePathStyle,
	apiKey,
}: RenderStillOnLambdaNonNullInput): Promise<
	ServerlessPayloads<AwsProvider>[ServerlessRoutines.still]
> => {
	if (quality) {
		throw new Error(
			'The `quality` option is deprecated. Use `jpegQuality` instead.',
		);
	}

	const stringifiedInputProps = serializeOrThrow(inputProps, 'input-props');

	const serializedInputProps = await compressInputProps({
		stringifiedInputProps,
		region,
		needsToUpload: getNeedsToUpload({
			type: 'still',
			sizes: [
				stringifiedInputProps.length,
				JSON.stringify(envVariables).length,
			],
			providerSpecifics: awsImplementation,
		}),
		userSpecifiedBucketName: forceBucketName ?? null,
		propsType: 'input-props',
		providerSpecifics: awsImplementation,
		forcePathStyle,
		skipPutAcl: privacy === 'no-acl',
	});

	return {
		composition,
		serveUrl,
		inputProps: serializedInputProps,
		imageFormat,
		envVariables,
		jpegQuality,
		maxRetries,
		frame,
		privacy,
		attempt: 1,
		logLevel,
		outName,
		timeoutInMilliseconds,
		chromiumOptions,
		scale,
		downloadBehavior,
		version: VERSION,
		forceHeight,
		forceWidth,
		bucketName: forceBucketName,
		offthreadVideoCacheSizeInBytes,
		deleteAfter,
		type: ServerlessRoutines.still,
		streamed: true,
		forcePathStyle,
		apiKey: apiKey ?? null,
		offthreadVideoThreads: null,
	};
};
