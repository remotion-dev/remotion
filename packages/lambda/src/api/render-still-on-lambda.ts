import type {
	ChromiumOptions,
	LogLevel,
	StillImageFormat,
} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import type {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import type {CostsInfo, OutNameInput, Privacy} from '../shared/constants';
import {DEFAULT_MAX_RETRIES, LambdaRoutines} from '../shared/constants';
import type {DownloadBehavior} from '../shared/content-disposition-header';
import {getCloudwatchStreamUrl} from '../shared/get-aws-urls';
import {serializeInputProps} from '../shared/serialize-input-props';

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
	dumpBrowserLogs?: boolean;
};

export type RenderStillOnLambdaOutput = {
	estimatedPrice: CostsInfo;
	url: string;
	sizeInBytes: number;
	bucketName: string;
	renderId: string;
	cloudWatchLogs: string;
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
 * @param params.dumpBrowserLogs Whether to print browser logs to CloudWatch.
 * @returns {Promise<RenderStillOnLambdaOutput>} See documentation for exact response structure.
 */

export const renderStillOnLambda = async ({
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
}: RenderStillOnLambdaInput): Promise<RenderStillOnLambdaOutput> => {
	if (quality) {
		throw new Error(
			'The `quality` option is deprecated. Use `jpegQuality` instead.'
		);
	}

	const serializedInputProps = await serializeInputProps({
		inputProps,
		region,
		type: 'still',
		userSpecifiedBucketName: forceBucketName ?? null,
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
				logLevel: logLevel ?? 'info',
				outName: outName ?? null,
				timeoutInMilliseconds: timeoutInMilliseconds ?? 30000,
				chromiumOptions: chromiumOptions ?? {},
				scale: scale ?? 1,
				downloadBehavior: downloadBehavior ?? {type: 'play-in-browser'},
				version: VERSION,
				forceHeight: forceHeight ?? null,
				forceWidth: forceWidth ?? null,
				bucketName: forceBucketName ?? null,
				dumpBrowserLogs: dumpBrowserLogs ?? false,
			},
			region,
		});
		return {
			estimatedPrice: res.estimatedPrice,
			url: res.output,
			sizeInBytes: res.size,
			bucketName: res.bucketName,
			renderId: res.renderId,
			cloudWatchLogs: getCloudwatchStreamUrl({
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
				'UnrecognizedClientException: The AWS credentials provided were probably mixed up. Learn how to fix this issue here: https://remotion.dev/docs/lambda/troubleshooting/unrecognizedclientexception'
			);
		}

		throw err;
	}
};
