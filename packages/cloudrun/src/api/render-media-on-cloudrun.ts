import {
	type AudioCodec,
	type ChromiumOptions,
	type FrameRange,
	type LogLevel,
	type PixelFormat,
	type ProResProfile,
	type ToOptions,
	type VideoImageFormat,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import {NoReactInternals} from 'remotion/no-react';
import {VERSION} from 'remotion/version';
import type {z} from 'zod';
import type {
	CloudRunCrashResponse,
	CloudRunPayload,
	CloudRunPayloadType,
	DownloadBehavior,
	ErrorResponsePayload,
	RenderMediaOnCloudrunOutput,
} from '../functions/helpers/payloads';
import type {GcpRegion} from '../pricing/gcp-regions';
import type {CloudrunCodec} from '../shared/validate-gcp-codec';
import {validateCloudrunCodec} from '../shared/validate-gcp-codec';
import {validatePrivacy} from '../shared/validate-privacy';
import {validateServeUrl} from '../shared/validate-serveurl';
import {getOrCreateBucket} from './get-or-create-bucket';
import {getAuthClientForUrl} from './helpers/get-auth-client-for-url';
import {getCloudrunEndpoint} from './helpers/get-cloudrun-endpoint';

type InternalRenderMediaOnCloudrun = {
	cloudRunUrl: string | undefined;
	serviceName: string | undefined;
	region: GcpRegion;
	serveUrl: string;
	composition: string;
	inputProps: Record<string, unknown>;
	privacy: 'public' | 'private' | undefined;
	forceBucketName: string | undefined;
	outName: string | undefined;
	updateRenderProgress:
		| ((progress: number, error?: boolean) => void)
		| undefined;
	codec: CloudrunCodec;
	audioCodec: AudioCodec | undefined;
	jpegQuality: number | undefined;
	proResProfile: ProResProfile | undefined;
	pixelFormat: PixelFormat | undefined;
	imageFormat: VideoImageFormat | undefined;
	everyNthFrame: number | undefined;
	frameRange: FrameRange | undefined;
	envVariables: Record<string, string> | undefined;
	chromiumOptions: ChromiumOptions | undefined;
	forceWidth: number | null;
	forceHeight?: number | null;
	concurrency: number | string | null;
	preferLossless: boolean | undefined;
	indent: boolean;
	logLevel: LogLevel;
	downloadBehavior: DownloadBehavior;
	metadata?: Record<string, string> | null;
	renderIdOverride: z.infer<typeof CloudRunPayload>['renderIdOverride'];
	renderStatusWebhook: z.infer<typeof CloudRunPayload>['renderStatusWebhook'];
} & ToOptions<typeof BrowserSafeApis.optionsMap.renderMediaOnCloudRun>;

export type RenderMediaOnCloudrunInput = {
	region: GcpRegion;
	serveUrl: string;
	composition: string;
	renderId?: string | undefined;
	codec: CloudrunCodec;
	cloudRunUrl?: string;
	serviceName?: string;
	inputProps?: Record<string, unknown>;
	privacy?: 'public' | 'private';
	forceBucketName?: string;
	outName?: string;
	updateRenderProgress?: (progress: number, error?: boolean) => void;
	audioCodec?: AudioCodec;
	encodingMaxRate?: string | null;
	encodingBufferSize?: string | null;
	proResProfile?: ProResProfile;
	pixelFormat?: PixelFormat;
	imageFormat?: VideoImageFormat;
	everyNthFrame?: number;
	frameRange?: FrameRange;
	envVariables?: Record<string, string>;
	chromiumOptions?: ChromiumOptions;
	forceWidth?: number | null;
	forceHeight?: number | null;
	concurrency?: number | string | null;
	preferLossless?: boolean;
	downloadBehavior?: DownloadBehavior;
	metadata?: Record<string, string> | null;
	renderIdOverride?: z.infer<typeof CloudRunPayload>['renderIdOverride'];
	renderStatusWebhook?: z.infer<typeof CloudRunPayload>['renderStatusWebhook'];
} & Partial<ToOptions<typeof BrowserSafeApis.optionsMap.renderMediaOnCloudRun>>;

const internalRenderMediaOnCloudrunRaw = async ({
	cloudRunUrl,
	serviceName,
	region,
	serveUrl,
	composition,
	inputProps,
	codec,
	forceBucketName,
	privacy,
	outName,
	updateRenderProgress,
	renderIdOverride,
	renderStatusWebhook,
	jpegQuality,
	audioCodec,
	audioBitrate,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	proResProfile,
	x264Preset,
	crf,
	pixelFormat,
	imageFormat,
	scale,
	everyNthFrame,
	numberOfGifLoops,
	frameRange,
	envVariables,
	chromiumOptions,
	muted,
	forceWidth,
	forceHeight,
	logLevel,
	delayRenderTimeoutInMilliseconds,
	concurrency,
	enforceAudioTrack,
	preferLossless,
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	colorSpace,
	downloadBehavior,
	metadata,
}: InternalRenderMediaOnCloudrun): Promise<
	RenderMediaOnCloudrunOutput | CloudRunCrashResponse
> => {
	const actualCodec = validateCloudrunCodec(codec);
	validateServeUrl(serveUrl);
	if (privacy) validatePrivacy(privacy);

	const outputBucket =
		forceBucketName ?? (await getOrCreateBucket({region})).bucketName;

	const cloudRunEndpoint = await getCloudrunEndpoint({
		cloudRunUrl,
		serviceName,
		region,
	});

	const data: CloudRunPayloadType = {
		composition,
		serveUrl,
		codec: actualCodec,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: inputProps ?? {},
			}).serializedString,
		jpegQuality: jpegQuality ?? null,
		audioCodec: audioCodec ?? null,
		audioBitrate: audioBitrate ?? null,
		videoBitrate: videoBitrate ?? null,
		encodingBufferSize: encodingBufferSize ?? null,
		encodingMaxRate: encodingMaxRate ?? null,
		crf: crf ?? null,
		pixelFormat: pixelFormat ?? null,
		imageFormat: imageFormat ?? null,
		scale: scale ?? 1,
		proResProfile: proResProfile ?? null,
		x264Preset: x264Preset ?? null,
		everyNthFrame: everyNthFrame ?? 1,
		numberOfGifLoops: numberOfGifLoops ?? null,
		frameRange: frameRange ?? null,
		envVariables: envVariables ?? {},
		chromiumOptions,
		muted: muted ?? false,
		outputBucket,
		privacy,
		outName,
		forceWidth,
		forceHeight,
		type: 'media',
		logLevel: logLevel ?? 'info',
		delayRenderTimeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? null,
		concurrency: concurrency ?? null,
		enforceAudioTrack: enforceAudioTrack ?? false,
		preferLossless: preferLossless ?? false,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		offthreadVideoThreads: offthreadVideoThreads ?? null,
		colorSpace: colorSpace ?? null,
		clientVersion: VERSION,
		downloadBehavior,
		metadata: metadata ?? null,
		renderIdOverride,
		renderStatusWebhook,
	};

	const client = await getAuthClientForUrl(cloudRunEndpoint);

	const postResponse = await client.request({
		url: cloudRunEndpoint,
		method: 'POST',
		data,
		responseType: 'stream',
	});

	const renderResponse = await new Promise<
		RenderMediaOnCloudrunOutput | CloudRunCrashResponse
	>((resolve, reject) => {
		// TODO: Add any sort of type safety
		let response:
			| RenderMediaOnCloudrunOutput
			| ErrorResponsePayload
			| CloudRunCrashResponse;

		const startTime = Date.now();
		const formattedStartTime = new Date().toISOString();

		const stream: any = postResponse.data;

		let accumulatedChunks = ''; // A buffer to accumulate chunks.

		stream.on('data', (chunk: Buffer) => {
			accumulatedChunks += chunk.toString(); // Add the new chunk to the buffer.
			let parsedData;

			try {
				parsedData = JSON.parse(accumulatedChunks.trim());
				accumulatedChunks = ''; // Clear the buffer after successful parsing.
			} catch {
				// eslint-disable-next-line no-console
				console.error('Could not parse progress: ', accumulatedChunks.trim());
				// If parsing fails, it means we don't have a complete JSON string yet.
				// We'll wait for more chunks.
				return;
			}

			if (parsedData.response) {
				response = parsedData.response;
			} else if (parsedData.onProgress) {
				updateRenderProgress?.(parsedData.onProgress);
			}

			if (parsedData.type === 'error') {
				reject(parsedData);
			}
		});

		stream.on('end', () => {
			if (!response) {
				const crashTime = Date.now();
				const formattedCrashTime = new Date().toISOString();

				updateRenderProgress?.(0, true);

				resolve({
					type: 'crash',
					cloudRunEndpoint,
					message:
						'Service crashed without sending a response. Check the logs in GCP console.',
					requestStartTime: formattedStartTime,
					requestCrashTime: formattedCrashTime,
					requestElapsedTimeInSeconds: (crashTime - startTime) / 1000,
				});
			} else if (response.type !== 'success' && response.type !== 'crash') {
				throw response;
			}

			resolve(response);
		});

		stream.on('error', (error: Error) => {
			reject(error);
		});
	});

	return renderResponse;
};

export const internalRenderMediaOnCloudrun = wrapWithErrorHandling(
	internalRenderMediaOnCloudrunRaw,
) as typeof internalRenderMediaOnCloudrunRaw;

/*
 * @description Initiates a media rendering process on the Remotion Cloud Run service, facilitating configurations like service region, project composition, and output settings.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/rendermediaoncloudrun)
 */
export const renderMediaOnCloudrun = ({
	cloudRunUrl,
	serviceName,
	region,
	serveUrl,
	composition,
	inputProps,
	codec,
	forceBucketName,
	privacy,
	outName,
	updateRenderProgress,
	jpegQuality,
	audioCodec,
	audioBitrate,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	proResProfile,
	x264Preset,
	crf,
	pixelFormat,
	imageFormat,
	scale,
	everyNthFrame,
	numberOfGifLoops,
	frameRange,
	envVariables,
	chromiumOptions,
	muted,
	forceWidth,
	forceHeight,
	logLevel,
	delayRenderTimeoutInMilliseconds,
	concurrency,
	enforceAudioTrack,
	preferLossless,
	offthreadVideoCacheSizeInBytes,
	colorSpace,
	downloadBehavior,
	metadata,
	renderIdOverride,
	renderStatusWebhook,
	offthreadVideoThreads,
}: RenderMediaOnCloudrunInput): Promise<
	RenderMediaOnCloudrunOutput | CloudRunCrashResponse
> => {
	return internalRenderMediaOnCloudrun({
		cloudRunUrl: cloudRunUrl ?? undefined,
		serviceName: serviceName ?? undefined,
		region,
		serveUrl,
		composition,
		inputProps: inputProps ?? {},
		codec,
		forceBucketName: forceBucketName ?? undefined,
		privacy: privacy ?? undefined,
		outName: outName ?? undefined,
		updateRenderProgress: updateRenderProgress ?? undefined,
		jpegQuality: jpegQuality ?? 80,
		audioCodec: audioCodec ?? undefined,
		audioBitrate: audioBitrate ?? null,
		videoBitrate: videoBitrate ?? null,
		encodingMaxRate: encodingMaxRate ?? null,
		encodingBufferSize: encodingBufferSize ?? null,
		proResProfile: proResProfile ?? undefined,
		x264Preset: x264Preset ?? null,
		crf: crf ?? undefined,
		pixelFormat: pixelFormat ?? undefined,
		imageFormat: imageFormat ?? undefined,
		scale: scale ?? 1,
		everyNthFrame: everyNthFrame ?? undefined,
		numberOfGifLoops: numberOfGifLoops ?? null,
		frameRange: frameRange ?? undefined,
		envVariables: envVariables ?? undefined,
		chromiumOptions: chromiumOptions ?? undefined,
		muted: muted ?? false,
		forceWidth: forceWidth ?? null,
		forceHeight: forceHeight ?? null,
		logLevel: logLevel ?? 'info',
		delayRenderTimeoutInMilliseconds:
			delayRenderTimeoutInMilliseconds ?? BrowserSafeApis.DEFAULT_TIMEOUT,
		concurrency: concurrency ?? null,
		enforceAudioTrack: enforceAudioTrack ?? false,
		preferLossless: preferLossless ?? false,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		colorSpace: colorSpace ?? null,
		indent: false,
		downloadBehavior: downloadBehavior ?? {
			type: 'play-in-browser',
		},
		metadata: metadata ?? null,
		renderIdOverride: renderIdOverride ?? undefined,
		renderStatusWebhook: renderStatusWebhook ?? undefined,
		offthreadVideoThreads: offthreadVideoThreads ?? null,
	});
};
