import {VERSION} from 'remotion/version';
import type {ServerlessPayload} from './constants';
import {ServerlessRoutines} from './constants';

export const infoHandler = <Region extends string>(
	serverlessParams: ServerlessPayload<Region>,
) => {
	if (serverlessParams.type !== ServerlessRoutines.info) {
		throw new TypeError('Expected info type');
	}

	const returnValue = {
		version: VERSION,
		type: 'success' as const,
	};

	return Promise.resolve(returnValue);
};
