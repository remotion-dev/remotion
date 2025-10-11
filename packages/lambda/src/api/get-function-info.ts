import {GetFunctionCommand} from '@aws-sdk/client-lambda';
import type {AwsRegion, RequestHandler} from '@remotion/lambda-client';
import {
	getFunctionVersion,
	LambdaClientInternals,
} from '@remotion/lambda-client';
import {DEFAULT_EPHEMERAL_STORAGE_IN_MB} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import type {FunctionInfo} from '@remotion/serverless';

export type GetFunctionInfoInput = {
	region: AwsRegion;
	functionName: string;
	logLevel?: LogLevel;
	requestHandler?: RequestHandler;
};

/*
 * @description Gets information about a function given its name and region.
 * @see [Documentation](https://remotion.dev/docs/lambda/getfunctioninfo)
 */
export const getFunctionInfo = async ({
	region,
	functionName,
	logLevel,
	requestHandler,
}: GetFunctionInfoInput): Promise<FunctionInfo> => {
	LambdaClientInternals.validateAwsRegion(region);

	const [functionInfo, version] = await Promise.all([
		LambdaClientInternals.getLambdaClient(
			region,
			undefined,
			requestHandler,
		).send(
			new GetFunctionCommand({
				FunctionName: functionName,
			}),
		),
		getFunctionVersion({
			functionName,
			region,
			logLevel: logLevel ?? 'info',
			requestHandler,
		}),
	]);

	return {
		functionName,
		timeoutInSeconds: functionInfo.Configuration?.Timeout as number,
		memorySizeInMb: functionInfo.Configuration?.MemorySize as number,
		version,
		diskSizeInMb:
			functionInfo.Configuration?.EphemeralStorage?.Size ??
			DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	};
};
