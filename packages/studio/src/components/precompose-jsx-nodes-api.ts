import type {
	PrecomposeJsxNodesRequest,
	PrecomposeJsxNodesResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const precomposeJsxNodes = (
	request: PrecomposeJsxNodesRequest,
): Promise<PrecomposeJsxNodesResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.precomposeJsxNodes(request);
	}

	return callApi('/api/precompose-jsx-nodes', request);
};
