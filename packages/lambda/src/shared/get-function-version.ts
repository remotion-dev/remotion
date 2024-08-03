import type {LogLevel} from '@remotion/renderer';
import {ServerlessRoutines} from '@remotion/serverless/client';
import type {AwsRegion} from '../regions';
import {callLambda} from './call-lambda';
import {COMMAND_NOT_FOUND} from './constants';

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
			type: ServerlessRoutines.info,
			timeoutInTest: 120000,
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
