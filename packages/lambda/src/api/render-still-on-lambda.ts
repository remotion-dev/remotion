import type {
	ChromiumOptions,
	StillImageFormat,
	ToOptions,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import type {CostsInfo, OutNameInput, Privacy} from '../shared/constants';
import {LambdaRoutines} from '../shared/constants';
import type {DownloadBehavior} from '../shared/content-disposition-header';
import {
	getCloudwatchMethodUrl,
	getLambdaInsightsUrl,
} from '../shared/get-aws-urls';
import {makeLambdaRenderStillPayload} from './make-lambda-payload';

export type RenderStillOnLambdaInput = {
	region: AwsRegion;
	functionName: string;
	serveUrl: string;
	composition: string;
	inputProps: Record<string, unknown>;
	imageFormat: StillImageFormat;
	privacy: Privacy;
	maxRetries?: number;
	envVariables?: Record<string, string>;
	/**
	 * @deprecated Renamed to `jpegQuality`
	 */
	quality?: never;
	frame?: number;
	outName?: OutNameInput;
	chromiumOptions?: ChromiumOptions;
	downloadBehavior?: DownloadBehavior;
	forceWidth?: number | null;
	forceHeight?: number | null;
	forceBucketName?: string;
	/**
	 * @deprecated Renamed to `dumpBrowserLogs`
	 */
	dumpBrowserLogs?: boolean;
	onInit?: (data: {
		renderId: string;
		cloudWatchLogs: string;
		lambdaInsightsUrl: string;
	}) => void;
} & Partial<ToOptions<typeof BrowserSafeApis.optionsMap.renderStillOnLambda>>;

export type RenderStillOnLambdaOutput = {
	estimatedPrice: CostsInfo;
	url: string;
	outKey: string;
	sizeInBytes: number;
	bucketName: string;
	renderId: string;
	cloudWatchLogs: string;
};

const renderStillOnLambdaRaw = async (
	input: RenderStillOnLambdaInput,
): Promise<RenderStillOnLambdaOutput> => {
	const {functionName, region, onInit} = input;
	try {
		const res = await callLambda({
			functionName,
			type: LambdaRoutines.still,
			payload: await makeLambdaRenderStillPayload(input),
			region,
			receivedStreamingPayload: (payload) => {
				if (payload.type === 'render-id-determined') {
					onInit?.({
						renderId: payload.renderId,
						cloudWatchLogs: getCloudwatchMethodUrl({
							functionName,
							method: LambdaRoutines.still,
							region,
							rendererFunctionName: null,
							renderId: payload.renderId,
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
export const renderStillOnLambda = NoReactAPIs.wrapWithErrorHandling(
	renderStillOnLambdaRaw,
) as typeof renderStillOnLambdaRaw;
