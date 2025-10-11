import type {LogLevel} from '@remotion/serverless-client';
import {
	COMMAND_NOT_FOUND,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import {awsImplementation} from './aws-provider';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

export const getFunctionVersion = async ({
	functionName,
	region,
	logLevel,
	requestHandler,
}: {
	functionName: string;
	region: AwsRegion;
	logLevel: LogLevel;
	requestHandler: RequestHandler | null | undefined;
}): Promise<string> => {
	try {
		// For now, we'll pass requestHandler to the awsImplementation if needed
		// This might require deeper changes in the serverless-client framework
		const result = await awsImplementation.callFunctionSync({
			functionName,
			payload: {
				logLevel,
				type: ServerlessRoutines.info,
			},
			region,
			type: ServerlessRoutines.info,
			timeoutInTest: 120000,
			requestHandler,
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
