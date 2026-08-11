import type {AwsProvider, AwsRegion} from '@remotion/lambda-client';
import type {
	DeleteFunction,
	FunctionInfo,
	GetFunctions,
} from '@remotion/serverless';
import {VERSION} from 'remotion/version';

export let mockFunctionsStore: (FunctionInfo & {
	region: AwsRegion;
	version: string;
})[] = [];

export const addFunction = (fn: FunctionInfo, region: AwsRegion) => {
	mockFunctionsStore.push({
		...fn,
		region,
		version: fn.version as string,
	});
};

export const deleteMockFunction: DeleteFunction<AwsProvider> = ({
	functionName,
	region,
}) => {
	mockFunctionsStore = mockFunctionsStore.filter(
		(fn) => fn.functionName !== functionName && fn.region !== region,
	);
	return Promise.resolve();
};

export const findFunction = (name: string, region: string) => {
	return mockFunctionsStore.find(
		(n) => n.functionName === name && region === n.region,
	);
};

export const getAllMockFunctions: GetFunctions<AwsProvider> = ({
	compatibleOnly,
	region,
}) => {
	return Promise.resolve(
		mockFunctionsStore
			.filter(
				(f) =>
					f.region === region &&
					(compatibleOnly ? f.version === VERSION : true),
			)
			.map(({region: _region, ...f}) => f),
	);
};

export const cleanFnStore = () => {
	mockFunctionsStore = [];
};

export const markFunctionAsIncompatible = (functionName: string) => {
	for (const fn of mockFunctionsStore) {
		if (fn.functionName === functionName) {
			fn.version = '2021-06-23';
		}
	}
};
