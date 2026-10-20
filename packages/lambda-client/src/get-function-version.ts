import type {LogLevel} from '@remotion/renderer';
import {callFunctionSyncImplementation} from './call-lambda-sync';
import type {AwsRegion} from './regions';
import {COMMAND_NOT_FOUND, ServerlessRoutines} from './shared-constants';
import type {RequestHandler} from './types';

export async function getFunctionVersion({
	functionName,
	region,
	logLevel,
	requestHandler,
}: {
	functionName: string;
	region: AwsRegion;
	logLevel: LogLevel;
	requestHandler: RequestHandler | null | undefined;
}): Promise<string> {
	try {
		const result = await callFunctionSyncImplementation({
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
}
