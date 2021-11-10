import {CURRENT_VERSION} from '../../defaults';
import {createFunction as original} from '../create-function';
import {addFunction} from '../mock-functions';

export const createFunction: typeof original = async (input) => {
	addFunction(
		{
			functionName: input.functionName,
			memorySizeInMb: 1024,
			timeoutInSeconds: input.timeoutInSeconds,
			version: CURRENT_VERSION,
		},
		input.region
	);
	return Promise.resolve({
		FunctionName: input.functionName,
	});
};
