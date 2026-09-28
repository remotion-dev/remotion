import type {WrapNodeRequest, WrapNodeResponse} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const wrapNode = (
	request: WrapNodeRequest,
): Promise<WrapNodeResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.wrapNode(request);
	}

	return callApi('/api/wrap-node', request);
};
