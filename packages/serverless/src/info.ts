import {VERSION} from 'remotion/version';
import type {LambdaPayload} from './constants';
import {LambdaRoutines} from './constants';

export const infoHandler = (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.info) {
		throw new TypeError('Expected info type');
	}

	const returnValue = {
		version: VERSION,
		type: 'success' as const,
	};

	return Promise.resolve(returnValue);
};
