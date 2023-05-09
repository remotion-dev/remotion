import type {ChromiumOptions, FrameRange} from '@remotion/renderer';
import got from 'got/dist/source';
import {validateCloudRunUrl} from '../shared/validate-cloudrun-url';
import type {CloudrunCodec} from '../shared/validate-gcp-codec';
import {validateCloudrunCodec} from '../shared/validate-gcp-codec';
import {validatePrivacy} from '../shared/validate-privacy';
import {validateRegion} from '../shared/validate-region';
import {validateServeUrl} from '../shared/validate-serveurl';
import {validateServiceName} from '../shared/validate-service-name';
import {getServiceInfo} from './get-service-info';
import {getAuthClientForUrl} from './helpers/get-auth-client-for-url';

export type RenderMediaOnCloudrunInput = {
	authenticatedRequest: boolean;
	cloudRunUrl: string;
	serviceName?: string;
	region?: string;
	serveUrl?: string;
	composition: string;
	inputProps?: unknown;
	codec: CloudrunCodec;
	privacy?: string;
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

export type RenderMediaOnCloudrunOutput = {
	authenticatedRequest: boolean;
	publicUrl: string;
	cloudStorageUri: string;
	size: string;
	bucketName: string;
	renderId: string;
	status: string;
	privacy: string;
	errMessage: string;
	error: any;
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
	authenticatedRequest,
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

	if (!cloudRunUrl && !serviceName)
		throw new Error('Either cloudRunUrl or serviceName must be provided');
	if (cloudRunUrl && serviceName)
		throw new Error(
			'Either cloudRunUrl or serviceName must be provided, not both'
		);

	if (cloudRunUrl) {
		validateCloudRunUrl(cloudRunUrl);
	}

	if (serviceName) {
		validateServiceName(serviceName);
		const validatedRegion = validateRegion(region);
		const {uri} = await getServiceInfo({serviceName, region: validatedRegion});
		cloudRunUrl = uri;
	}

	const data = {
		type: 'media',
		composition,
		serveUrl,
		codec: actualCodec,
		inputProps,
		outputBucket,
		privacy,
		outputFile,
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
	};

	if (authenticatedRequest) {
		const client = await getAuthClientForUrl(cloudRunUrl);

		const authenticatedDataPromise = new Promise((resolve, reject) => {
			client
				.request({
					url: cloudRunUrl,
					method: 'POST',
					data,
					responseType: 'stream',
				})
				.then((postResponse) => {
					const stream: any = postResponse.data;

					stream.on('data', (chunk: Buffer) => {
						const chunkResponse = JSON.parse(chunk.toString());
						if (chunkResponse.response) {
							authenticatedResponse = chunkResponse.response;
						} else if (chunkResponse.onProgress) {
							updateRenderProgress?.(chunkResponse.onProgress);
						}
					});

					stream.on('end', () => {
						resolve(response);
					});

					stream.on('error', (error: any) => {
						reject(error);
					});
				});
		});

		let authenticatedResponse = await authenticatedDataPromise;
		return authenticatedResponse as RenderMediaOnCloudrunOutput;
	}

	const dataPromise = new Promise((resolve, reject) => {
		got.stream
			.post(cloudRunUrl, {json: data})
			.on('data', (chunk) => {
				const chunkResponse = JSON.parse(chunk.toString());
				if (chunkResponse.response) {
					response = chunkResponse.response;
				} else if (chunkResponse.onProgress) {
					updateRenderProgress?.(chunkResponse.onProgress);
				}
			})
			.on('end', () => {
				resolve(response);
			})
			.on('error', (error) => {
				reject(error);
			});
	});

	let response = await dataPromise;
	return response as RenderMediaOnCloudrunOutput;
};
