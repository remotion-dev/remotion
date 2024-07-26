import {VERSION} from 'remotion/version';
import type {LambdaPayload} from './constants';
import {ServerlessRoutines} from './constants';

export const infoHandler = (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== ServerlessRoutines.info) {
		throw new TypeError('Expected info type');
	}

	const returnValue = {
		version: VERSION,
		type: 'success' as const,
	};

	return Promise.resolve(returnValue);
};
