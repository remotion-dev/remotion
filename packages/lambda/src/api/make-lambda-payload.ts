import type {
	AudioCodec,
	ChromiumOptions,
	ColorSpace,
	FrameRange,
	LogLevel,
	PixelFormat,
	ProResProfile,
	ToOptions,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {VERSION} from 'remotion/version';
import type {AwsRegion, DeleteAfter} from '../client';
import type {
	LambdaPayloads,
	LambdaStartPayload,
	LambdaStatusPayload,
	OutNameInput,
	Privacy,
	WebhookOption,
} from '../defaults';
import {LambdaRoutines} from '../defaults';
import {
	compressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from '../shared/compress-props';
import type {DownloadBehavior} from '../shared/content-disposition-header';
import {validateDownloadBehavior} from '../shared/validate-download-behavior';
import {validateFramesPerLambda} from '../shared/validate-frames-per-lambda';
import type {LambdaCodec} from '../shared/validate-lambda-codec';
import {validateLambdaCodec} from '../shared/validate-lambda-codec';
import {validateServeUrl} from '../shared/validate-serveurl';
import {validateWebhook} from '../shared/validate-webhook';
import type {GetRenderProgressInput} from './get-render-progress';
import type {RenderStillOnLambdaNonNullInput} from './render-still-on-lambda';

export type InnerRenderMediaOnLambdaInput = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps: Record<string, unknown>;
	codec: LambdaCodec;
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
	outName: OutNameInput | null;
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
}: InnerRenderMediaOnLambdaInput): Promise<LambdaStartPayload> => {
	const actualCodec = validateLambdaCodec(codec);
	validateServeUrl(serveUrl);
	validateFramesPerLambda({
		framesPerLambda: framesPerLambda ?? null,
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
		needsToUpload: getNeedsToUpload('video-or-audio', [
			stringifiedInputProps.length,
		]),
		userSpecifiedBucketName: bucketName ?? null,
		propsType: 'input-props',
	});
	return {
		rendererFunctionName,
		framesPerLambda,
		composition,
		serveUrl,
		inputProps: serialized,
		codec: actualCodec,
		imageFormat,
		crf,
		envVariables,
		pixelFormat,
		proResProfile,
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
		overwrite: overwrite ?? false,
		audioBitrate: audioBitrate ?? null,
		videoBitrate: videoBitrate ?? null,
		encodingBufferSize: encodingBufferSize ?? null,
		encodingMaxRate: encodingMaxRate ?? null,
		webhook: webhook ?? null,
		forceHeight: forceHeight ?? null,
		forceWidth: forceWidth ?? null,
		bucketName: bucketName ?? null,
		audioCodec: audioCodec ?? null,
		type: LambdaRoutines.start,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		deleteAfter: deleteAfter ?? null,
		colorSpace: colorSpace ?? null,
		preferLossless: preferLossless ?? false,
	};
};

export const getRenderProgressPayload = ({
	bucketName,
	renderId,
	s3OutputProvider,
	logLevel,
}: GetRenderProgressInput): LambdaStatusPayload => {
	return {
		type: LambdaRoutines.status,
		bucketName,
		renderId,
		version: VERSION,
		s3OutputProvider,
		logLevel: logLevel ?? 'info',
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
}: RenderStillOnLambdaNonNullInput): Promise<
	LambdaPayloads[LambdaRoutines.still]
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
		needsToUpload: getNeedsToUpload('still', [stringifiedInputProps.length]),
		userSpecifiedBucketName: forceBucketName ?? null,
		propsType: 'input-props',
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
		type: LambdaRoutines.still,
		streamed: true,
	};
};
