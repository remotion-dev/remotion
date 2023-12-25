import type {
	ChromiumOptions,
	LogLevel,
	StillImageFormat,
	ToOptions,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {PureJSAPIs} from '@remotion/renderer/pure';
import {VERSION} from 'remotion/version';
import type {DeleteAfter} from '../functions/helpers/lifecycle';
import type {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import {
	compressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from '../shared/compress-props';
import type {CostsInfo, OutNameInput, Privacy} from '../shared/constants';
import {DEFAULT_MAX_RETRIES, LambdaRoutines} from '../shared/constants';
import type {DownloadBehavior} from '../shared/content-disposition-header';
import {
	getCloudwatchMethodUrl,
	getLambdaInsightsUrl,
} from '../shared/get-aws-urls';

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
	jpegQuality?: number;
	frame?: number;
	logLevel?: LogLevel;
	outName?: OutNameInput;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
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
	deleteAfter?: DeleteAfter | null;
} & Partial<ToOptions<typeof BrowserSafeApis.optionsMap.renderMediaOnLambda>>;

export type RenderStillOnLambdaOutput = {
	estimatedPrice: CostsInfo;
	url: string;
	sizeInBytes: number;
	bucketName: string;
	renderId: string;
	cloudWatchLogs: string;
};

const renderStillOnLambdaRaw = async ({
	functionName,
	serveUrl,
	inputProps,
	imageFormat,
	envVariables,
	quality,
	jpegQuality,
	region,
	maxRetries,
	composition,
	privacy,
	frame,
	logLevel,
	outName,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	downloadBehavior,
	forceHeight,
	forceWidth,
	forceBucketName,
	dumpBrowserLogs,
	onInit,
	offthreadVideoCacheSizeInBytes,
	deleteAfter,
}: RenderStillOnLambdaInput): Promise<RenderStillOnLambdaOutput> => {
	if (quality) {
		throw new Error(
			'The `quality` option is deprecated. Use `jpegQuality` instead.',
		);
	}

	const stringifiedInputProps = serializeOrThrow(inputProps, 'input-props');

	const serializedInputProps = await compressInputProps({
		stringifiedInputProps,
		region,
		needsToUpload: getNeedsToUpload('still', [stringifiedInputProps.length]),
		userSpecifiedBucketName: forceBucketName ?? null,
		propsType: 'input-props',
	});

	try {
		const res = await callLambda({
			functionName,
			type: LambdaRoutines.still,
			payload: {
				composition,
				serveUrl,
				inputProps: serializedInputProps,
				imageFormat,
				envVariables,
				jpegQuality,
				maxRetries: maxRetries ?? DEFAULT_MAX_RETRIES,
				frame: frame ?? 0,
				privacy,
				attempt: 1,
				logLevel: dumpBrowserLogs ? 'verbose' : logLevel ?? 'info',
				outName: outName ?? null,
				timeoutInMilliseconds: timeoutInMilliseconds ?? 30000,
				chromiumOptions: chromiumOptions ?? {},
				scale: scale ?? 1,
				downloadBehavior: downloadBehavior ?? {type: 'play-in-browser'},
				version: VERSION,
				forceHeight: forceHeight ?? null,
				forceWidth: forceWidth ?? null,
				bucketName: forceBucketName ?? null,
				offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
				deleteAfter: deleteAfter ?? null,
			},
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
export const renderStillOnLambda = PureJSAPIs.wrapWithErrorHandling(
	renderStillOnLambdaRaw,
) as typeof renderStillOnLambdaRaw;
