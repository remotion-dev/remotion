import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
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

export type GetCompositionsOnLambdaOutput = {};

export const getCompositionsOnLambda = async ({
	chromiumOptions,
	serveUrl,
	region,
	inputProps,
	functionName,
	envVariables,
	logLevel,
	timeoutInMilliseconds,
}: GetCompositionsOnLambdaInput) => {
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
