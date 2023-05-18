import type {ChromiumOptions, FrameRange} from '@remotion/renderer';
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
};

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/lambda/renderMediaOnGcp)
 * @param params.authenticatedRequest If this is an authenticated request, .env file will be checked for GCP credentials
 * @param params.cloudRunUrl The url of the Cloud Run service that should be used
 * @param params.serviceName The name of the Cloud Run service that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.codec The media codec which should be used for encoding.
 * @param params.outputBucket The name of the GCP Storage Bucket that will store the rendered media output.
 * @param params.outputFolderPath The folder path of the GCP Storage Bucket that will store the rendered media output.
 * @param params.outName The file name of the rendered media output.
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
