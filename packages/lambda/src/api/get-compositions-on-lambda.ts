import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import type {TCompMetadata} from 'remotion';
import {VERSION} from 'remotion/version';
import type {AwsRegion} from '../client';
import {LambdaRoutines} from '../defaults';
import {callLambda} from '../shared/call-lambda';
import {convertToServeUrl} from '../shared/convert-to-serve-url';
import {serializeInputProps} from '../shared/serialize-input-props';

export type GetCompositionsOnLambdaInput = {
	chromiumOptions?: ChromiumOptions;
	region: AwsRegion;
	inputProps: unknown;
	functionName: string;
	serveUrl: string;
	envVariables?: Record<string, string>;
	logLevel?: LogLevel;
	timeoutInMilliseconds?: number;
};

export type GetCompositionsOnLambdaOutput = {
	compositions: TCompMetadata[];
};

/**
 * @description Returns the compositions from a serveUrl
 * @link https://remotion.dev/docs/lambda/getcompositionsonlambda
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
}: GetCompositionsOnLambdaInput): Promise<GetCompositionsOnLambdaOutput> => {
	const realServeUrl = await convertToServeUrl(serveUrl, region);

	const serializedInputProps = await serializeInputProps({
		inputProps,
		region,
		type: 'still',
	});

	try {
		const res = await callLambda({
			functionName,
			type: LambdaRoutines.compositions,
			payload: {
				chromiumOptions: chromiumOptions ?? {},
				serveUrl: realServeUrl,
				envVariables,
				inputProps: serializedInputProps,
				logLevel: logLevel ?? 'info',
				timeoutInMilliseconds: timeoutInMilliseconds ?? 30000,
				version: VERSION,
			},
			region,
		});
		return {
			compositions: res.compositions,
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
