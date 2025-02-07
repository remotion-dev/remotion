import type {
	BrowserSafeApis,
	ChromiumOptions,
	ToOptions,
	VideoConfig,
} from '@remotion/serverless-client';
import {
	ServerlessRoutines,
	VERSION,
	compressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from '@remotion/serverless-client';
import {awsImplementation} from './aws-provider';
import type {AwsRegion} from './regions';

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
				stringifiedInputProps.length,
				JSON.stringify(envVariables).length,
			],
			providerSpecifics: awsImplementation,
		}),
		providerSpecifics: awsImplementation,
		forcePathStyle: forcePathStyle ?? false,
		skipPutAcl: false,
	});

	try {
		const res = await awsImplementation.callFunctionSync({
			functionName,
			type: ServerlessRoutines.compositions,
			payload: {
				type: ServerlessRoutines.compositions,
				chromiumOptions: chromiumOptions ?? {},
				serveUrl,
				envVariables,
				inputProps: serializedInputProps,
				logLevel: dumpBrowserLogs ? 'verbose' : (logLevel ?? 'info'),
				timeoutInMilliseconds: timeoutInMilliseconds ?? 30000,
				version: VERSION,
				bucketName: bucketName ?? null,
				offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
				forcePathStyle: forcePathStyle ?? false,
			},
			region,
			timeoutInTest: 120000,
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
