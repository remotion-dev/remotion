import type {ChromiumOptions, ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import type {VideoConfig} from 'remotion/no-react';
import {VERSION} from 'remotion/version';
import type {AwsRegion} from '../client';
import {LambdaRoutines} from '../defaults';
import {callLambda} from '../shared/call-lambda';
import {
	compressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from '../shared/compress-props';

export type GetCompositionsOnLambdaInput = {
	chromiumOptions?: ChromiumOptions;
	region: AwsRegion;
	inputProps: Record<string, unknown>;
	functionName: string;
	serveUrl: string;
	envVariables?: Record<string, string>;
	forceBucketName?: string;
	/**
	 * @deprecated in favor of `logLevel`: true
	 */
	dumpBrowserLogs?: boolean;
} & Partial<
	ToOptions<typeof BrowserSafeApis.optionsMap.getCompositionsOnLambda>
>;

export type GetCompositionsOnLambdaOutput = VideoConfig[];

/**
 * @description Returns the compositions from a serveUrl
 * @see [Documentation](https://remotion.dev/docs/lambda/getcompositionsonlambda)
 * @param params.functionName The name of the Lambda function that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.inputProps The input props that should be passed while the compositions are evaluated.
 * @param params.envVariables Object containing environment variables to be inserted into the video environment
 * @param params.region The AWS region in which the video should be rendered.
 * @param params.logLevel The log level of the Lambda function
 * @param params.timeoutInMilliseconds The timeout of the Lambda function
 * @param params.chromiumOptions The options to pass to Chromium
 * @returns The compositions
 */
export const getCompositionsOnLambda = async ({
	chromiumOptions,
	serveUrl,
	region,
	inputProps,
	functionName,
	envVariables,
	logLevel,
	timeoutInMilliseconds,
	forceBucketName: bucketName,
	dumpBrowserLogs,
	offthreadVideoCacheSizeInBytes,
}: GetCompositionsOnLambdaInput): Promise<GetCompositionsOnLambdaOutput> => {
	const stringifiedInputProps = serializeOrThrow(inputProps, 'input-props');

	const serializedInputProps = await compressInputProps({
		stringifiedInputProps,
		region,
		userSpecifiedBucketName: bucketName ?? null,
		propsType: 'input-props',
		needsToUpload: getNeedsToUpload('video-or-audio', [
			stringifiedInputProps.length,
		]),
	});

	try {
		const res = await callLambda({
			functionName,
			type: LambdaRoutines.compositions,
			payload: {
				chromiumOptions: chromiumOptions ?? {},
				serveUrl,
				envVariables,
				inputProps: serializedInputProps,
				logLevel: dumpBrowserLogs ? 'verbose' : logLevel ?? 'info',
				timeoutInMilliseconds: timeoutInMilliseconds ?? 30000,
				version: VERSION,
				bucketName: bucketName ?? null,
				offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
			},
			region,
			timeoutInTest: 120000,
			retriesRemaining: 0,
		});
		return res.compositions;
	} catch (err) {
		if ((err as Error).stack?.includes('UnrecognizedClientException')) {
			throw new Error(
				'UnrecognizedClientException: The AWS credentials provided were probably mixed up. Learn how to fix this issue here: https://remotion.dev/docs/lambda/troubleshooting/unrecognizedclientexception',
			);
		}

		throw err;
	}
};
