import type {
	AudioCodec,
	ChromiumOptions,
	FrameRange,
	LogLevel,
	PixelFormat,
	ProResProfile,
	ToOptions,
	VideoImageFormat,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import {NoReactInternals} from 'remotion/no-react';
import {VERSION} from 'remotion/version';
import type {
	CloudRunCrashResponse,
	CloudRunPayloadType,
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
} & Partial<ToOptions<typeof BrowserSafeApis.optionsMap.renderMediaOnCloudRun>>;

export type RenderMediaOnCloudrunInput = {
	cloudRunUrl?: string;
	serviceName?: string;
	region: GcpRegion;
	serveUrl: string;
	composition: string;
	inputProps?: Record<string, unknown>;
	privacy?: 'public' | 'private';
	forceBucketName?: string;
	outName?: string;
	updateRenderProgress?: (progress: number, error?: boolean) => void;
	codec: CloudrunCodec;
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
		colorSpace: colorSpace ?? null,
		clientVersion: VERSION,
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
			} catch (e) {
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

export const internalRenderMediaOnCloudrun = NoReactAPIs.wrapWithErrorHandling(
	internalRenderMediaOnCloudrunRaw,
) as typeof internalRenderMediaOnCloudrunRaw;

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/renderMediaOnGcp)
 * @param params.cloudRunUrl The URL of the Cloud Run service that should be used. Use either this or serviceName.
 * @param params.serviceName The name of the Cloud Run service that should be used. Use either this or cloudRunUrl.
 * @param params.region The region that the Cloud Run service is deployed in.
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.codec The media codec which should be used for encoding.
 * @param params.forceBucketName The name of the bucket that the output file should be uploaded to.
 * @param params.privacy Whether the output file should be public or private.
 * @param params.outName The name of the output file.
 * @param params.updateRenderProgress A callback that is called with the progress of the render.
 * @param params.jpegQuality JPEG quality if JPEG was selected as the image format.
 * @param params.audioCodec The encoding of the audio of the output video.
 * @param params.audioBitrate The target bitrate for the audio of the generated video.
 * @param params.videoBitrate The target bitrate of the generated video.
 * @param params.encodingBufferSize The decoder buffer size, which determines the variability of the generated video bitrate.
 * @param params.encodingMaxRate The maximum bitrate tolerance to be used, this is only used in conjunction with encodingBufferSize.
 * @param params.proResProfile Sets a ProRes profile. Only applies to videos rendered with prores codec.
 * @param params.x264Preset Sets a Preset profile. Only applies to videos rendered with h.264 codec.
 * @param params.crf Constant Rate Factor, controlling the quality.
 * @param params.pixelFormat Custom pixel format to use. Usually used for special use cases like transparent videos.
 * @param params.imageFormat Which image format the frames should be rendered in.
 * @param params.scale Scales the output dimensions by a factor.
 * @param params.everyNthFrame Only used if rendering gigs - renders only every nth frame.
 * @param params.numberOfGifLoops Only used if rendering gigs - how many times the gif should loop. Null means infinite.
 * @param params.frameRange Specify a single frame (a number) or a range of frames (a tuple [number, number]) to be rendered.
 * @param params.envVariables Object containing environment variables to be injected in your project.
 * @param params.chromiumOptions Allows you to set certain Chromium / Google Chrome flags.
 * @param params.muted If set to true, no audio is rendered.
 * @param params.forceWidth Overrides default composition width.
 * @param params.forceHeight Overrides default composition height.
 * @param params.logLevel Level of logging that Cloud Run service should perform. Default "info".
 * @param params.delayRenderTimeoutInMilliseconds A number describing how long the render may take to resolve all delayRender() calls before it times out.
 * @param params.concurrency A number or a string describing how many browser tabs should be opened. Default "50%".
 * @param params.enforceAudioTrack Render a silent audio track if there wouldn't be any otherwise.
 * @param params.preferLossless Uses a lossless audio codec, if one is available for the codec. If you set audioCodec, it takes priority over preferLossless.
 * @returns {Promise<RenderMediaOnCloudrunOutput>} See documentation for detailed structure
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
		jpegQuality: jpegQuality ?? undefined,
		audioCodec: audioCodec ?? undefined,
		audioBitrate: audioBitrate ?? null,
		videoBitrate: videoBitrate ?? null,
		encodingMaxRate: encodingMaxRate ?? null,
		encodingBufferSize: encodingBufferSize ?? null,
		proResProfile: proResProfile ?? undefined,
		x264Preset: x264Preset ?? undefined,
		crf: crf ?? undefined,
		pixelFormat: pixelFormat ?? undefined,
		imageFormat: imageFormat ?? undefined,
		scale: scale ?? undefined,
		everyNthFrame: everyNthFrame ?? undefined,
		numberOfGifLoops: numberOfGifLoops ?? null,
		frameRange: frameRange ?? undefined,
		envVariables: envVariables ?? undefined,
		chromiumOptions: chromiumOptions ?? undefined,
		muted: muted ?? undefined,
		forceWidth: forceWidth ?? null,
		forceHeight: forceHeight ?? null,
		logLevel: logLevel ?? 'info',
		delayRenderTimeoutInMilliseconds:
			delayRenderTimeoutInMilliseconds ?? undefined,
		concurrency: concurrency ?? null,
		enforceAudioTrack: enforceAudioTrack ?? undefined,
		preferLossless: preferLossless ?? undefined,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? undefined,
		colorSpace: colorSpace ?? undefined,
		indent: false,
	});
};
