import type {ChromiumOptions, ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import type {VideoConfig} from 'remotion/no-react';
import {VERSION} from 'remotion/version';
import {callFunctionSyncImplementation} from './call-lambda-sync';
import {
	compressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from './compress-props';
import {getSizeInBytes} from './get-size-in-bytes';
import type {AwsRegion} from './regions';
import {ServerlessRoutines} from './shared-constants';
import type {RequestHandler} from './types';

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
	forcePathStyle?: boolean;
	requestHandler?: RequestHandler | null;
} & Partial<
	ToOptions<typeof BrowserSafeApis.optionsMap.getCompositionsOnLambda>
>;

export type GetCompositionsOnLambdaOutput = VideoConfig[];

/*
 * @description Gets the compositions inside a Lambda function.
 * @see [Documentation](https://remotion.dev/docs/lambda/getcompositionsonlambda)
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
	forcePathStyle,
	requestHandler,
	mediaCacheSizeInBytes,
}: GetCompositionsOnLambdaInput): Promise<GetCompositionsOnLambdaOutput> => {
	const stringifiedInputProps = serializeOrThrow(inputProps, 'input-props');

	const serializedInputProps = await compressInputProps({
		stringifiedInputProps,
		region,
		userSpecifiedBucketName: bucketName ?? null,
		propsType: 'input-props',
		needsToUpload: getNeedsToUpload({
			type: 'video-or-audio',
			sizes: [
				getSizeInBytes(stringifiedInputProps),
				getSizeInBytes(JSON.stringify(envVariables ?? {})),
			],
		}),
		forcePathStyle: forcePathStyle ?? false,
		skipPutAcl: false,
		requestHandler,
		logLevel: logLevel ?? 'info',
	});

	try {
		const res = await callFunctionSyncImplementation({
			functionName,
			type: ServerlessRoutines.compositions,
			payload: {
				type: ServerlessRoutines.compositions,
				chromiumOptions: chromiumOptions ?? {},
				serveUrl,
				envVariables: envVariables ?? {},
				inputProps: serializedInputProps,
				logLevel: dumpBrowserLogs ? 'verbose' : (logLevel ?? 'info'),
				timeoutInMilliseconds: timeoutInMilliseconds ?? 30000,
				version: VERSION,
				bucketName: bucketName ?? null,
				offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
				forcePathStyle: forcePathStyle ?? false,
				mediaCacheSizeInBytes: mediaCacheSizeInBytes ?? null,
			},
			region,
			timeoutInTest: 120000,
			requestHandler,
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
