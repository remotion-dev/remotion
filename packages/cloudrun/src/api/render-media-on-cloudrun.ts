import type {ChromiumOptions, FrameRange, LogLevel} from '@remotion/renderer';
import type {
	CloudRunPayloadType,
	RenderMediaOnCloudrunOutput,
} from '../functions/helpers/payloads';
import type {CloudrunCodec} from '../shared/validate-gcp-codec';
import {validateCloudrunCodec} from '../shared/validate-gcp-codec';
import {validatePrivacy} from '../shared/validate-privacy';
import {validateServeUrl} from '../shared/validate-serveurl';
import {getAuthClientForUrl} from './helpers/get-auth-client-for-url';
import {getCloudrunEndpoint} from './helpers/get-cloudrun-endpoint';

export type RenderMediaOnCloudrunInput = {
	cloudRunUrl?: string;
	serviceName?: string;
	region?: string;
	serveUrl: string;
	composition: string;
	inputProps?: unknown;
	codec: CloudrunCodec;
	privacy?: 'public' | 'private';
	outputBucket: string;
	outputFile?: string;
	updateRenderProgress?: (progress: number) => void;
	jpegQuality?: number;
	audioCodec?: 'mp3' | 'aac' | 'pcm-16' | 'opus';
	audioBitrate?: string | null;
	videoBitrate?: string | null;
	proResProfile?:
		| '4444-xq'
		| '4444'
		| 'hq'
		| 'standard'
		| 'light'
		| 'proxy'
		| undefined;
	crf?: number | undefined;
	pixelFormat?:
		| 'yuv420p'
		| 'yuva420p'
		| 'yuv422p'
		| 'yuv444p'
		| 'yuv420p10le'
		| 'yuv422p10le'
		| 'yuv444p10le'
		| 'yuva444p10le';
	imageFormat?: 'png' | 'jpeg' | 'none';
	scale?: number;
	everyNthFrame?: number;
	numberOfGifLoops?: number | null;
	frameRange?: FrameRange;
	envVariables?: Record<string, string>;
	chromiumOptions?: ChromiumOptions;
	muted?: boolean;
	forceWidth?: number | null;
	forceHeight?: number | null;
	logLevel?: LogLevel;
};

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/lambda/renderMediaOnGcp)
 * @param params.cloudRunUrl The URL of the Cloud Run service that should be used. Use either this or serviceName.
 * @param params.serviceName The name of the Cloud Run service that should be used. Use either this or cloudRunUrl.
 * @param params.region The region that the Cloud Run service is deployed in.
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.codec The media codec which should be used for encoding.
 * @param params.outputBucket The name of the bucket that the output file should be uploaded to.
 * @param params.privacy Whether the output file should be public or private.
 * @param params.outputFile The name of the output file.
 * @param params.updateRenderProgress A callback that is called with the progress of the render.
 * @param params.jpegQuality JPEG quality if JPEG was selected as the image format.
 * @param params.audioCodec The encoding of the audio of the output video.
 * @param params.audioBitrate The target bitrate for the audio of the generated video.
 * @param params.videoBitrate The target bitrate of the generated video.
 * @param params.proResProfile Sets a ProRes profile. Only applies to videos rendered with prores codec.
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
 * @returns {Promise<RenderMediaOnCloudrunOutput>} See documentation for detailed structure
 */

export const renderMediaOnCloudrun = async ({
	cloudRunUrl,
	serviceName,
	region,
	serveUrl,
	composition,
	inputProps,
	codec,
	outputBucket,
	privacy,
	outputFile,
	updateRenderProgress,
	jpegQuality,
	audioCodec,
	audioBitrate,
	videoBitrate,
	proResProfile,
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
}: RenderMediaOnCloudrunInput): Promise<RenderMediaOnCloudrunOutput> => {
	const actualCodec = validateCloudrunCodec(codec);
	validateServeUrl(serveUrl);
	if (privacy) validatePrivacy(privacy);

	const cloudRunEndpoint = await getCloudrunEndpoint({
		cloudRunUrl,
		serviceName,
		region,
	});

	const data: CloudRunPayloadType = {
		composition,
		serveUrl,
		codec: actualCodec,
		inputProps,
		jpegQuality,
		audioCodec,
		audioBitrate,
		videoBitrate,
		crf,
		pixelFormat,
		imageFormat,
		scale,
		proResProfile,
		everyNthFrame,
		numberOfGifLoops,
		frameRange,
		envVariables,
		chromiumOptions,
		muted,
		outputBucket,
		privacy,
		outputFile,
		forceWidth,
		forceHeight,
		type: 'media',
		logLevel: logLevel ?? 'info',
	};

	const client = await getAuthClientForUrl(cloudRunEndpoint);

	const postResponse = await client.request({
		url: cloudRunEndpoint,
		method: 'POST',
		data,
		responseType: 'stream',
	});

	const authenticatedDataPromise =
		await new Promise<RenderMediaOnCloudrunOutput>((resolve, reject) => {
			// TODO: Add any sort of type safety
			let response: any;

			const stream: any = postResponse.data;

			stream.on('data', (chunk: Buffer) => {
				const chunkResponse = JSON.parse(chunk.toString());
				if (chunkResponse.response) {
					response = chunkResponse.response;
				} else if (chunkResponse.onProgress) {
					updateRenderProgress?.(chunkResponse.onProgress);
				}
			});

			stream.on('end', () => {
				if (!response) {
					reject(new Error('no response received'));
					return;
				}

				resolve(response);
			});

			stream.on('error', (error: Error) => {
				reject(error);
			});
		});

	return authenticatedDataPromise;
};
