import {FunctionInfo} from '../get-function-info';

export let mockFunctionsStore: FunctionInfo[] = [];

export const addFunction = (fn: FunctionInfo) => {
	mockFunctionsStore.push(fn);
};

export const deleteFunction = (name: string) => {
	mockFunctionsStore = mockFunctionsStore.filter(
		(fn) => fn.functionName !== name
	);
};

export const findFunction = (name: string) => {
	return mockFunctionsStore.find((n) => n.functionName === name);
};

export const getAllMockFunctions = () => {
	return mockFunctionsStore;
};

export const cleanFnStore = () => {
	mockFunctionsStore = [];
};
