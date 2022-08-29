import {VERSION} from 'remotion/version';
import type {LambdaPayload} from '../shared/constants';
import {LambdaRoutines} from '../shared/constants';

export const infoHandler = (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.info) {
		throw new TypeError('Expected info type');
	}

	const returnValue = {
		version: VERSION,
	};

	return Promise.resolve(returnValue);
};
