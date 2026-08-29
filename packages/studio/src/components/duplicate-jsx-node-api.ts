import type {
	DuplicateJsxNodeRequest,
	DuplicateJsxNodeResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const duplicateJsxNode = (
	request: DuplicateJsxNodeRequest,
): Promise<DuplicateJsxNodeResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.duplicateJsxNode(request)
		: callApi('/api/duplicate-jsx-node', request);
};
