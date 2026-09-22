import type {
	DeleteJsxNodesRequest,
	DeleteJsxNodesResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const deleteJsxNodes = (
	request: DeleteJsxNodesRequest,
): Promise<DeleteJsxNodesResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.deleteJsxNodes(request)
		: callApi('/api/delete-jsx-nodes', request);
};
