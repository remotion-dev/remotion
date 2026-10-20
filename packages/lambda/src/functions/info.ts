import {
	ServerlessRoutines,
	type ServerlessPayload,
} from '@remotion/lambda-client';
import {VERSION} from 'remotion/version';

export const infoHandler = (serverlessParams: ServerlessPayload) => {
	if (serverlessParams.type !== ServerlessRoutines.info) {
		throw new TypeError('Expected info type');
	}

	const returnValue = {
		version: VERSION,
		type: 'success' as const,
	};

	return Promise.resolve(returnValue);
};
