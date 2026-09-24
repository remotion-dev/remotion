import type {
	WrapJsxNodeRequest,
	WrapJsxNodeResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const wrapJsxNode = (
	request: WrapJsxNodeRequest,
): Promise<WrapJsxNodeResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.wrapJsxNode(request);
	}

	return callApi('/api/wrap-jsx-node', request);
};
