import type {
	ReorderSequenceRequest,
	ReorderSequenceResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const reorderSequence = (
	request: ReorderSequenceRequest,
): Promise<ReorderSequenceResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.reorderSequence(request)
		: callApi('/api/reorder-sequence', request);
};
