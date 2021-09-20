import {AwsRegion} from '..';
import {FunctionInfo} from './get-function-info';

export let mockFunctionsStore: (FunctionInfo & {region: AwsRegion})[] = [];

export const addFunction = (fn: FunctionInfo, region: AwsRegion) => {
	mockFunctionsStore.push({...fn, region});
};

export const deleteMockFunction = (name: string, region: string) => {
	mockFunctionsStore = mockFunctionsStore.filter(
		(fn) => fn.functionName !== name && fn.region !== region
	);
};

export const findFunction = (name: string, region: string) => {
	return mockFunctionsStore.find(
		(n) => n.functionName === name && region === n.region
	);
};

export const getAllMockFunctions = (region: string) => {
	return mockFunctionsStore.filter((f) => f.region === region);
};

export const cleanFnStore = () => {
	mockFunctionsStore = [];
};
