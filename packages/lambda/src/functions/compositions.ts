import type {LambdaPayload} from '../defaults';
import {LambdaRoutines} from '../defaults';

export const compositionsHandler = (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.compositions) {
		throw new TypeError('Expected info compositions');
	}

	return Promise.resolve({});
};
