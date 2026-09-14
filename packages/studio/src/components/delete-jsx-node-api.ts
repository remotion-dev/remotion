import type {
	DeleteJsxNodeRequest,
	DeleteJsxNodeResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const deleteJsxNode = (
	request: DeleteJsxNodeRequest,
): Promise<DeleteJsxNodeResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.deleteJsxNode(request)
		: callApi('/api/delete-jsx-node', request);
};
