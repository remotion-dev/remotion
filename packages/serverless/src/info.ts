import type {
	CloudProvider,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {ServerlessRoutines, VERSION} from '@remotion/serverless-client';

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
