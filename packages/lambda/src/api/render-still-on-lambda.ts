import type {
	ChromiumOptions,
	StillImageFormat,
	ToOptions,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import type {DownloadBehavior} from '@remotion/serverless/client';
import {ServerlessRoutines} from '@remotion/serverless/client';
import {callLambdaWithStreaming} from '../shared/call-lambda';

import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import type {
	ReceivedArtifact,
	RenderStillLambdaResponsePayload,
} from '@remotion/serverless';
import type {OutNameInput, Privacy} from '@remotion/serverless/client';
import type {AwsProvider} from '../functions/aws-implementation';
import type {AwsRegion} from '../regions';
import type {CostsInfo} from '../shared/constants';
import {DEFAULT_MAX_RETRIES} from '../shared/constants';
import {
	getCloudwatchMethodUrl,
	getLambdaInsightsUrl,
} from '../shared/get-aws-urls';
import {makeLambdaRenderStillPayload} from './make-lambda-payload';

type MandatoryParameters = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps: Record<string, unknown>;
	imageFormat: StillImageFormat;
	privacy: Privacy;
};

type OptionalParameters = {
	maxRetries: number;
	envVariables: Record<string, string>;
	/**
	 * @deprecated Renamed to `jpegQuality`
	 */
	quality?: never;
	frame: number;
	outName: OutNameInput<AwsProvider> | null;
	chromiumOptions: ChromiumOptions;
	downloadBehavior: DownloadBehavior;
	forceWidth: number | null;
	forceHeight: number | null;
	forceBucketName: string | null;
	/**
	 * @deprecated Renamed to `logLevel`
	 */
	dumpBrowserLogs: boolean;
	onInit: (data: {
		renderId: string;
		cloudWatchLogs: string;
		lambdaInsightsUrl: string;
	}) => void;
	indent: boolean;
	forcePathStyle: boolean;
	metadata: Record<string, string> | null;
} & ToOptions<typeof BrowserSafeApis.optionsMap.renderStillOnLambda>;

export type RenderStillOnLambdaNonNullInput = MandatoryParameters &
	OptionalParameters;

export type RenderStillOnLambdaInput = MandatoryParameters &
	Partial<OptionalParameters>;

export type RenderStillOnLambdaOutput = {
	estimatedPrice: CostsInfo;
	url: string;
	outKey: string;
	sizeInBytes: number;
	bucketName: string;
	renderId: string;
	cloudWatchLogs: string;
	artifacts: ReceivedArtifact<AwsProvider>[];
};

const internalRenderStillOnLambda = async (
	input: RenderStillOnLambdaNonNullInput,
): Promise<RenderStillOnLambdaOutput> => {
	const {functionName, region, onInit} = input;
	try {
		const payload = await makeLambdaRenderStillPayload(input);
		const res = await new Promise<
			RenderStillLambdaResponsePayload<AwsProvider>
		>((resolve, reject) => {
			callLambdaWithStreaming<AwsProvider, ServerlessRoutines.still>({
				functionName,
				type: ServerlessRoutines.still,
				payload,
				region,
				receivedStreamingPayload: ({message}) => {
					if (message.type === 'render-id-determined') {
						onInit?.({
							renderId: message.payload.renderId,
							cloudWatchLogs: getCloudwatchMethodUrl({
								functionName,
								method: ServerlessRoutines.still,
								region,
								rendererFunctionName: null,
								renderId: message.payload.renderId,
							}),
							lambdaInsightsUrl: getLambdaInsightsUrl({
								functionName,
								region,
							}),
						});
					}

					if (message.type === 'error-occurred') {
						reject(new Error(message.payload.error));
					}

					if (message.type === 'still-rendered') {
						resolve(message.payload);
					}
				},
				timeoutInTest: 120000,
				retriesRemaining: input.maxRetries,
			})
				.then(() => {
					reject(new Error('Expected response to be streamed'));
				})
				.catch((err) => {
					reject(err);
				});
		});

		return {
			estimatedPrice: res.estimatedPrice,
			url: res.output,
			outKey: res.outKey,
			sizeInBytes: res.size,
			bucketName: res.bucketName,
			renderId: res.renderId,
			cloudWatchLogs: getCloudwatchMethodUrl({
				functionName,
				method: ServerlessRoutines.still,
				region,
				renderId: res.renderId,
				rendererFunctionName: null,
			}),
			artifacts: res.receivedArtifacts,
		};
	} catch (err) {
		if ((err as Error).stack?.includes('UnrecognizedClientException')) {
			throw new Error(
				'UnrecognizedClientException: The AWS credentials provided were probably mixed up. Learn how to fix this issue here: https://remotion.dev/docs/lambda/troubleshooting/unrecognizedclientexception',
			);
		}

		throw err;
	}
};

const errorHandled = wrapWithErrorHandling(internalRenderStillOnLambda);

/**
 * @description Renders a still frame on Lambda
 * @link https://remotion.dev/docs/lambda/renderstillonlambda
 * @param params.functionName The name of the Lambda function that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.imageFormat In which image format the frames should be rendered.
 * @param params.envVariables Object containing environment variables to be inserted into the video environment
 * @param params.jpegQuality JPEG quality if JPEG was selected as the image format.
 * @param params.region The AWS region in which the video should be rendered.
 * @param params.maxRetries How often rendering a chunk may fail before the video render gets aborted.
 * @param params.frame Which frame should be used for the still image. Default 0.
 * @param params.privacy Whether the item in the S3 bucket should be public. Possible values: `"private"` and `"public"`
 * @param params.metadata Metadata to be attached to the S3 object.
 * @returns {Promise<RenderStillOnLambdaOutput>} See documentation for exact response structure.
 */
export const renderStillOnLambda = (input: RenderStillOnLambdaInput) => {
	return errorHandled({
		chromiumOptions: input.chromiumOptions ?? {},
		composition: input.composition,
		deleteAfter: input.deleteAfter ?? null,
		downloadBehavior: input.downloadBehavior ?? {type: 'play-in-browser'},
		envVariables: input.envVariables ?? {},
		forceBucketName: input.forceBucketName ?? null,
		forceHeight: input.forceHeight ?? null,
		forceWidth: input.forceWidth ?? null,
		frame: input.frame ?? 0,
		functionName: input.functionName,
		imageFormat: input.imageFormat,
		indent: false,
		inputProps: input.inputProps,
		maxRetries: input.maxRetries ?? DEFAULT_MAX_RETRIES,
		onInit: input.onInit ?? (() => undefined),
		outName: input.outName ?? null,
		privacy: input.privacy,
		quality: undefined,
		region: input.region,
		serveUrl: input.serveUrl,
		jpegQuality: input.jpegQuality ?? 80,
		logLevel: input.dumpBrowserLogs ? 'verbose' : (input.logLevel ?? 'info'),
		offthreadVideoCacheSizeInBytes:
			input.offthreadVideoCacheSizeInBytes ?? null,
		scale: input.scale ?? 1,
		timeoutInMilliseconds: input.timeoutInMilliseconds ?? 30000,
		dumpBrowserLogs: false,
		forcePathStyle: input.forcePathStyle ?? false,
		metadata: input.metadata ?? null,
	});
};
