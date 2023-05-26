import type {
	ChromiumOptions,
	LogLevel,
	StillImageFormat,
} from '@remotion/renderer';
import type {
	CloudRunPayloadType,
	RenderStillOnCloudrunOutput,
} from '../functions/helpers/payloads';
import {validatePrivacy} from '../shared/validate-privacy';
import {validateServeUrl} from '../shared/validate-serveurl';
import {getAuthClientForUrl} from './helpers/get-auth-client-for-url';
import {getCloudrunEndpoint} from './helpers/get-cloudrun-endpoint';

export type RenderStillOnCloudrunInput = {
	cloudRunUrl?: string;
	serviceName?: string;
	region?: string;
	serveUrl: string;
	composition: string;
	inputProps?: unknown;
	outputBucket: string;
	privacy?: 'public' | 'private';
	outputFile?: string;
	imageFormat: StillImageFormat;
	envVariables?: Record<string, string>;
	frame?: number;
	jpegQuality?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	forceWidth?: number | null;
	forceHeight?: number | null;
	logLevel?: LogLevel;
};

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/renderstilloncloudrun)
 * @param params.cloudRunUrl The URL of the Cloud Run service that should be used. Use either this or serviceName.
 * @param params.serviceName The name of the Cloud Run service that should be used. Use either this or cloudRunUrl.
 * @param params.region The region that the Cloud Run service is deployed in.
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.outputBucket The name of the bucket that the output file should be uploaded to.
 * @param params.privacy Whether the output file should be public or private.
 * @param params.outputFile The name of the output file.
 * @param params.imageFormat Which image format the frame should be rendered in.
 * @param params.envVariables Object containing environment variables to be injected in your project.
 * @param params.frame Which frame of the composition should be rendered. Frames are zero-indexed.
 * @param params.jpegQuality JPEG quality if JPEG was selected as the image format.
 * @param params.chromiumOptions Allows you to set certain Chromium / Google Chrome flags.
 * @param params.scale Scales the output dimensions by a factor.
 * @param params.forceWidth Overrides default composition width.
 * @param params.forceHeight Overrides default composition height.
 * @param params.logLevel Level of logging that Cloud Run service should perform. Default "info".
 * @returns {Promise<RenderStillOnCloudrunOutput>} See documentation for detailed structure
 */

export const renderStillOnCloudrun = async ({
	cloudRunUrl,
	serviceName,
	region,
	serveUrl,
	composition,
	inputProps,
	outputBucket,
	privacy,
	outputFile,
	imageFormat,
	envVariables,
	frame,
	jpegQuality,
	chromiumOptions,
	scale,
	forceWidth,
	forceHeight,
	logLevel,
}: RenderStillOnCloudrunInput): Promise<RenderStillOnCloudrunOutput> => {
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
		inputProps,
		outputBucket,
		outputFile,
		privacy,
		imageFormat,
		envVariables,
		jpegQuality,
		chromiumOptions,
		scale,
		forceWidth,
		forceHeight,
		frame: frame ?? 0,
		type: 'still',
		logLevel: logLevel ?? 'info',
	};

	const client = await getAuthClientForUrl(cloudRunEndpoint);

	const authenticatedResponse = await client.request({
		url: cloudRunUrl,
		method: 'POST',
		data,
	});
	return authenticatedResponse.data as RenderStillOnCloudrunOutput;
};
