import type {
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const splitJsxSequence = (
	request: SplitJsxSequenceRequest,
): Promise<SplitJsxSequenceResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.splitJsxSequence(request)
		: callApi('/api/split-jsx-sequence', request);
};
