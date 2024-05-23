import type {LogLevel} from '@remotion/renderer';
import type {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from './call-lambda';
import {COMMAND_NOT_FOUND, LambdaRoutines} from './constants';

export const getFunctionVersion = async ({
	functionName,
	region,
	logLevel,
}: {
	functionName: string;
	region: AwsRegion;
	logLevel: LogLevel;
}): Promise<string> => {
	try {
		const result = await callLambda({
			functionName,
			payload: {
				logLevel,
			},
			region,
			type: LambdaRoutines.info,
			timeoutInTest: 120000,
			retriesRemaining: 0,
			receivedStreamingPayload: () => undefined,
		});
		return result.version;
	} catch (err) {
		// Prerelease versions had no info command
		if ((err as Error).message.includes(COMMAND_NOT_FOUND)) {
			return 'n/a';
		}

		// Bug in certain version of AWS S3 kit
		if ((err as Error).message.includes('AWS CRT binary not present ')) {
			return 'n/a';
		}

		throw err;
	}
};
