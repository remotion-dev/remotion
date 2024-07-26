import type {LambdaPayload} from '@remotion/serverless/client';
import {LambdaRoutines} from '@remotion/serverless/client';
import {VERSION} from 'remotion/version';

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
