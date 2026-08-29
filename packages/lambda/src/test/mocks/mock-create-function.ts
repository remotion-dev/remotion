import type {AwsProvider} from '@remotion/lambda-client';
import type {CreateFunction} from '@remotion/serverless';
import {VERSION} from 'remotion/version';
import {addFunction} from './mock-functions';

type MockCreateFunctionCall = {
	alreadyCreated: boolean;
	customLayerArns: string[] | null;
};

const calls: MockCreateFunctionCall[] = [];

export const getMockCreateFunctionCalls = () => calls;

export const clearMockCreateFunctionCalls = () => {
	calls.length = 0;
};

export const mockCreateFunction: CreateFunction<AwsProvider> = (input) => {
	calls.push({
		alreadyCreated: input.alreadyCreated,
		customLayerArns: input.customLayerArns,
	});
	if (!input.alreadyCreated) {
		addFunction(
			{
				functionName: input.functionName,
				memorySizeInMb: input.memorySizeInMb,
				timeoutInSeconds: input.timeoutInSeconds,
				version: VERSION,
				diskSizeInMb: input.ephemerealStorageInMb,
			},
			input.region,
		);
	}

	return Promise.resolve({
		FunctionName: input.functionName,
	});
};
