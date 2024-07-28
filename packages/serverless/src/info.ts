import {VERSION} from 'remotion/version';
import type {ServerlessPayload} from './constants';
import {ServerlessRoutines} from './constants';
import type {CloudProvider} from './still';

export const infoHandler = <Provider extends CloudProvider>(
	serverlessParams: ServerlessPayload<Provider>,
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
