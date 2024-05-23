import type {
	ChromiumOptions,
	StillImageFormat,
	ToOptions,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {AwsRegion} from '../pricing/aws-regions';
import {callLambdaWithStreaming} from '../shared/call-lambda';
import type {CostsInfo, OutNameInput, Privacy} from '../shared/constants';
import {DEFAULT_MAX_RETRIES, LambdaRoutines} from '../shared/constants';
import type {DownloadBehavior} from '../shared/content-disposition-header';
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
	outName: OutNameInput | null;
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
};

const internalRenderStillOnLambda = async (
	input: RenderStillOnLambdaNonNullInput,
): Promise<RenderStillOnLambdaOutput> => {
	const {functionName, region, onInit} = input;
	try {
		const res = await callLambdaWithStreaming({
			functionName,
			type: LambdaRoutines.still,
			payload: await makeLambdaRenderStillPayload(input),
			region,
			receivedStreamingPayload: ({message}) => {
				if (message.type === 'render-id-determined') {
					onInit?.({
						renderId: message.payload.renderId,
						cloudWatchLogs: getCloudwatchMethodUrl({
							functionName,
							method: LambdaRoutines.still,
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
			},
			timeoutInTest: 120000,
			retriesRemaining: 0,
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
				method: LambdaRoutines.still,
				region,
				renderId: res.renderId,
				rendererFunctionName: null,
			}),
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

const errorHandled = NoReactAPIs.wrapWithErrorHandling(
	internalRenderStillOnLambda,
);

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
		logLevel: input.dumpBrowserLogs ? 'verbose' : input.logLevel ?? 'info',
		offthreadVideoCacheSizeInBytes:
			input.offthreadVideoCacheSizeInBytes ?? null,
		scale: input.scale ?? 1,
		timeoutInMilliseconds: input.timeoutInMilliseconds ?? 30000,
		dumpBrowserLogs: false,
	});
};
