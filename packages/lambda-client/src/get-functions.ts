import type {FunctionConfiguration} from '@aws-sdk/client-lambda';
import {ListFunctionsCommand} from '@aws-sdk/client-lambda';
import type {FunctionInfo, LogLevel} from '@remotion/serverless-client';
import {VERSION} from '@remotion/serverless-client';
import {getLambdaClient} from './aws-clients';
import {DEFAULT_EPHEMERAL_STORAGE_IN_MB, RENDER_FN_PREFIX} from './constants';
import {getFunctionVersion} from './get-function-version';
import type {AwsRegion} from './regions';

export type GetFunctionsInput = {
	region: AwsRegion;
	compatibleOnly: boolean;
	logLevel?: LogLevel;
};

const getAllFunctions = async ({
	existing,
	nextMarker,
	region,
}: {
	existing: FunctionConfiguration[];
	nextMarker: string | null;
	region: AwsRegion;
}): Promise<FunctionConfiguration[]> => {
	const allLambdas: FunctionConfiguration[] = [...existing];
	const lambdas = await getLambdaClient(region).send(
		new ListFunctionsCommand({
			Marker: nextMarker ?? undefined,
		}),
	);
	if (!lambdas.Functions) {
		return allLambdas;
	}

	for (const lambda of lambdas.Functions) {
		allLambdas.push(lambda);
	}

	if (lambdas.NextMarker) {
		return getAllFunctions({
			existing: allLambdas,
			nextMarker: lambdas.NextMarker,
			region,
		});
	}

	return allLambdas;
};

/*
 * @description Retrieves a list of functions that Remotion deployed to AWS Lambda in a certain region.
 * @see [Documentation](https://remotion.dev/docs/lambda/getfunctions)
 */
export const getFunctions = async (
	params: GetFunctionsInput,
): Promise<FunctionInfo[]> => {
	const lambdas = await getAllFunctions({
		existing: [],
		nextMarker: null,
		region: params.region,
	});

	const remotionLambdas = lambdas.filter((f) => {
		return f.FunctionName?.startsWith(RENDER_FN_PREFIX);
	});

	const configs = await Promise.all(
		remotionLambdas.map(async (fn) => {
			try {
				const version = await getFunctionVersion({
					functionName: fn.FunctionName as string,
					region: params.region,
					logLevel: params.logLevel ?? 'info',
				});
				return version;
			} catch {
				return null;
			}
		}),
	);

	const list = remotionLambdas.map((lambda, i): FunctionInfo => {
		return {
			functionName: lambda.FunctionName as string,
			version: configs[i],
			memorySizeInMb: lambda.MemorySize as number,
			timeoutInSeconds: lambda.Timeout as number,
			diskSizeInMb:
				lambda.EphemeralStorage?.Size ?? DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		};
	});
	if (!params.compatibleOnly) {
		return list;
	}

	return list.filter((l) => {
		if (!params.compatibleOnly) {
			return true;
		}

		return l.version === VERSION;
	});
};
