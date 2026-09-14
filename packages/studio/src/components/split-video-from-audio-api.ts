import type {
	SplitVideoFromAudioRequest,
	SplitVideoFromAudioResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const splitVideoFromAudio = (
	request: SplitVideoFromAudioRequest,
): Promise<SplitVideoFromAudioResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.splitVideoFromAudio(request)
		: callApi('/api/split-video-from-audio', request);
};
