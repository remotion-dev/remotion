import {
	CURRENT_VERSION,
	DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	DEFAULT_MEMORY_SIZE,
} from '../../defaults';
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
				diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
			},
			input.region
		);
	}

	return Promise.resolve({
		FunctionName: input.functionName,
	});
};
