import type {
	DeleteNodesRequest,
	DeleteNodesResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const deleteNodes = (
	request: DeleteNodesRequest,
): Promise<DeleteNodesResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.deleteNodes(request)
		: callApi('/api/delete-nodes', request);
};
