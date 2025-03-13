import type {LogLevel} from '@remotion/serverless-client';
import {
	COMMAND_NOT_FOUND,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import {awsImplementation} from './aws-provider';
import type {AwsRegion} from './regions';

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
		const result = await awsImplementation.callFunctionSync({
			functionName,
			payload: {
				logLevel,
				type: ServerlessRoutines.info,
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
