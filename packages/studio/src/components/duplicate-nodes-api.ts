import type {
	DuplicateNodesRequest,
	DuplicateNodesResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const duplicateNodes = (
	request: DuplicateNodesRequest,
): Promise<DuplicateNodesResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.duplicateNodes(request)
		: callApi('/api/duplicate-nodes', request);
};
