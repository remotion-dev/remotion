import type {
	BrowserSafeApis,
	ChromiumOptions,
	DownloadBehavior,
	StillImageFormat,
	ToOptions,
} from '@remotion/serverless-client';
import {ServerlessRoutines} from '@remotion/serverless-client';

import type {
	CostsInfo,
	OutNameInput,
	Privacy,
	ReceivedArtifact,
	RenderStillFunctionResponsePayload,
} from '@remotion/serverless-client';
import {wrapWithErrorHandling} from '@remotion/serverless-client';
import {awsImplementation, type AwsProvider} from './aws-provider';
import {DEFAULT_MAX_RETRIES} from './constants';
import {getCloudwatchMethodUrl, getLambdaInsightsUrl} from './get-aws-urls';
import {makeLambdaRenderStillPayload} from './make-lambda-payload';
import type {AwsRegion} from './regions';

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
			RenderStillFunctionResponsePayload<AwsProvider>
		>((resolve, reject) => {
			awsImplementation
				.callFunctionStreaming<ServerlessRoutines.still>({
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

/*
 * @description Renders a still image inside a lambda function and writes it to the specified output location.
 * @see [Documentation](https://remotion.dev/docs/lambda/renderstillonlambda)
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
		apiKey: input.apiKey ?? null,
		offthreadVideoThreads: input.offthreadVideoThreads ?? null,
	});
};
