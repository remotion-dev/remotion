import type {
	ChromiumOptions,
	StillImageFormat,
	ToOptions,
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
	RenderStillOnCloudrunOutput,
} from '../functions/helpers/payloads';
import type {GcpRegion} from '../pricing/gcp-regions';
import {validatePrivacy} from '../shared/validate-privacy';
import {validateServeUrl} from '../shared/validate-serveurl';
import {getOrCreateBucket} from './get-or-create-bucket';
import {getAuthClientForUrl} from './helpers/get-auth-client-for-url';
import {getCloudrunEndpoint} from './helpers/get-cloudrun-endpoint';

type MandatoryParameters = {
	region: GcpRegion;
	serveUrl: string;
	composition: string;
	imageFormat: StillImageFormat;
};

type OptionalParameters = {
	cloudRunUrl: string | null;
	serviceName: string | null;
	inputProps: Record<string, unknown>;
	privacy: 'public' | 'private';
	forceBucketName: string | null;
	outName: string | null;
	envVariables: Record<string, string>;
	frame: number;
	chromiumOptions: ChromiumOptions;
	forceWidth: number | null;
	forceHeight: number | null;
	indent: boolean;
	downloadBehavior: DownloadBehavior;
	renderIdOverride: z.infer<typeof CloudRunPayload>['renderIdOverride'];
	renderStatusWebhook: z.infer<typeof CloudRunPayload>['renderStatusWebhook'];
} & ToOptions<typeof BrowserSafeApis.optionsMap.renderStillOnCloudRun>;

export type RenderStillOnCloudrunInput = Partial<OptionalParameters> &
	MandatoryParameters;

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/renderstilloncloudrun)
 * @param params.cloudRunUrl The URL of the Cloud Run service that should be used. Use either this or serviceName.
 * @param params.serviceName The name of the Cloud Run service that should be used. Use either this or cloudRunUrl.
 * @param params.region The region that the Cloud Run service is deployed in.
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.forceBucketName The name of the bucket that the output file should be uploaded to.
 * @param params.privacy Whether the output file should be public or private.
 * @param params.outName The name of the output file.
 * @param params.imageFormat Which image format the frame should be rendered in.
 * @param params.envVariables Object containing environment variables to be injected in your project.
 * @param params.frame Which frame of the composition should be rendered. Frames are zero-indexed.
 * @param params.jpegQuality JPEG quality if JPEG was selected as the image format.
 * @param params.chromiumOptions Allows you to set certain Chromium / Google Chrome flags.
 * @param params.scale Scales the output dimensions by a factor.
 * @param params.forceWidth Overrides default composition width.
 * @param params.forceHeight Overrides default composition height.
 * @param params.logLevel Level of logging that Cloud Run service should perform. Default "info".
 * @param params.delayRenderTimeoutInMilliseconds A number describing how long the render may take to resolve all delayRender() calls before it times out.
 * @param params.metadata Metadata to be attached to the output file.
 * @returns {Promise<RenderStillOnCloudrunOutput>} See documentation for detailed structure
 */

const internalRenderStillOnCloudRun = async ({
	cloudRunUrl,
	serviceName,
	region,
	serveUrl,
	composition,
	inputProps,
	forceBucketName,
	privacy,
	outName,
	imageFormat,
	envVariables,
	frame,
	jpegQuality,
	chromiumOptions,
	scale,
	forceWidth,
	forceHeight,
	logLevel,
	delayRenderTimeoutInMilliseconds,
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	downloadBehavior,
	renderIdOverride,
	renderStatusWebhook,
}: OptionalParameters & MandatoryParameters): Promise<
	RenderStillOnCloudrunOutput | ErrorResponsePayload | CloudRunCrashResponse
> => {
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
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: inputProps ?? {},
			}).serializedString,
		outputBucket,
		outName,
		privacy,
		imageFormat,
		envVariables,
		jpegQuality,
		chromiumOptions,
		scale,
		forceWidth,
		forceHeight,
		frame,
		type: 'still',
		logLevel,
		delayRenderTimeoutInMilliseconds,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		clientVersion: VERSION,
		downloadBehavior,
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
		RenderStillOnCloudrunOutput | CloudRunCrashResponse
	>((resolve, reject) => {
		let response:
			| RenderStillOnCloudrunOutput
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
				// If parsing fails, it means we don't have a complete JSON string yet.
				// We'll wait for more chunks.
				return;
			}

			if (parsedData.response) {
				response = parsedData.response;
			}

			if (parsedData.type === 'error') {
				reject(parsedData);
			}
		});

		stream.on('end', () => {
			if (!response) {
				const crashTime = Date.now();
				const formattedCrashTime = new Date().toISOString();

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

const errorHandled = wrapWithErrorHandling(internalRenderStillOnCloudRun);

export const renderStillOnCloudrun = (options: RenderStillOnCloudrunInput) => {
	return errorHandled({
		chromiumOptions: options.chromiumOptions ?? {},
		cloudRunUrl: options.cloudRunUrl ?? null,
		composition: options.composition,
		delayRenderTimeoutInMilliseconds:
			options.delayRenderTimeoutInMilliseconds ?? 30000,
		envVariables: options.envVariables ?? {},
		forceBucketName: options.forceBucketName ?? null,
		forceHeight: options.forceHeight ?? null,
		forceWidth: options.forceWidth ?? null,
		frame: options.frame ?? 0,
		imageFormat: options.imageFormat,
		indent: options.indent ?? false,
		inputProps: options.inputProps ?? {},
		jpegQuality: options.jpegQuality ?? BrowserSafeApis.DEFAULT_JPEG_QUALITY,
		logLevel: options.logLevel ?? 'info',
		offthreadVideoCacheSizeInBytes:
			options.offthreadVideoCacheSizeInBytes ?? null,
		offthreadVideoThreads: options.offthreadVideoThreads ?? null,
		outName: options.outName ?? null,
		privacy: options.privacy ?? 'public',
		region: options.region,
		scale: options.scale ?? 1,
		serveUrl: options.serveUrl,
		serviceName: options.serviceName ?? null,
		downloadBehavior: options.downloadBehavior ?? {type: 'play-in-browser'},
		renderIdOverride: options.renderIdOverride ?? undefined,
		renderStatusWebhook: options.renderStatusWebhook ?? undefined,
	});
};
