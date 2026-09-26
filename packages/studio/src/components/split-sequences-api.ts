import type {
	SplitSequencesRequest,
	SplitSequencesResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const splitSequences = (
	request: SplitSequencesRequest,
): Promise<SplitSequencesResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.splitSequences(request)
		: callApi('/api/split-sequences', request);
};
