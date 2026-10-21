import type {
	UnwrapNodeRequest,
	UnwrapNodeResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const unwrapNode = (
	request: UnwrapNodeRequest,
): Promise<UnwrapNodeResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.unwrapNode(request);
	}

	return callApi('/api/unwrap-node', request);
};
