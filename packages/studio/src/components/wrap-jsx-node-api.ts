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
		if (!browserStudioOperations.wrapJsxNode) {
			return Promise.resolve({
				success: false,
				reason: 'Wrapping JSX is unavailable in this Browser Studio',
				stack: '',
			});
		}

		return browserStudioOperations.wrapJsxNode(request);
	}

	return callApi('/api/wrap-jsx-node', request);
};
