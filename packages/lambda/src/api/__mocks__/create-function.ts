import {CURRENT_VERSION, DEFAULT_MEMORY_SIZE} from '../../defaults';
import {createFunction as original} from '../create-function';
import {addFunction} from '../mock-functions';

export const createFunction: typeof original = async (input) => {
	if (!input.alreadyCreated) {
		addFunction(
			{
				functionName: input.functionName,
				memorySizeInMb: DEFAULT_MEMORY_SIZE,
				timeoutInSeconds: input.timeoutInSeconds,
				version: CURRENT_VERSION,
			},
			input.region
		);
	}

	return Promise.resolve({
		FunctionName: input.functionName,
	});
};
