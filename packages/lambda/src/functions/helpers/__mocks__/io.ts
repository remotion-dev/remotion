import {LambdaLSInput, LambdaLsReturnType} from '../io';

export const lambdaLs = (input: LambdaLSInput): LambdaLsReturnType => {
	if (!input) {
		throw new Error('need to pass input');
	}

	return Promise.resolve([]);
};
