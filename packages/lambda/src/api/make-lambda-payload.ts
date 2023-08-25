import {VERSION} from 'remotion/version';
import type {LambdaStartPayload, LambdaStatusPayload} from '../defaults';
import {LambdaRoutines} from '../defaults';
import {
	compressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from '../shared/compress-props';
import {validateDownloadBehavior} from '../shared/validate-download-behavior';
import {validateFramesPerLambda} from '../shared/validate-frames-per-lambda';
import {validateLambdaCodec} from '../shared/validate-lambda-codec';
import {validateServeUrl} from '../shared/validate-serveurl';
import {validateWebhook} from '../shared/validate-webhook';
import type {GetRenderProgressInput} from './get-render-progress';
import type {RenderMediaOnLambdaInput} from './render-media-on-lambda';

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
	downloadBehavior,
	muted,
	overwrite,
	dumpBrowserLogs,
	jpegQuality,
	quality,
	offthreadVideoCacheSizeInBytes,
}: RenderMediaOnLambdaInput): Promise<LambdaStartPayload> => {
	if (quality) {
		throw new Error(
			'quality has been renamed to jpegQuality. Please rename the option.',
		);
	}

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
		rendererFunctionName: rendererFunctionName ?? null,
		framesPerLambda: framesPerLambda ?? null,
		composition,
		serveUrl,
		inputProps: serialized,
		codec: actualCodec,
		imageFormat: imageFormat ?? 'jpeg',
		crf,
		envVariables,
		pixelFormat,
		proResProfile,
		x264Preset: x264Preset ?? null,
		jpegQuality,
		maxRetries: maxRetries ?? 1,
		privacy: privacy ?? 'public',
		logLevel: dumpBrowserLogs ? 'verbose' : logLevel ?? 'info',
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
		version: VERSION,
		overwrite: overwrite ?? false,
		audioBitrate: audioBitrate ?? null,
		videoBitrate: videoBitrate ?? null,
		webhook: webhook ?? null,
		forceHeight: forceHeight ?? null,
		forceWidth: forceWidth ?? null,
		bucketName: bucketName ?? null,
		audioCodec: audioCodec ?? null,
		type: LambdaRoutines.start,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
	};
};

export const getRenderProgressPayload = ({
	bucketName,
	renderId,
	s3OutputProvider,
}: GetRenderProgressInput): LambdaStatusPayload => {
	return {
		type: LambdaRoutines.status,
		bucketName,
		renderId,
		version: VERSION,
		s3OutputProvider,
	};
};
