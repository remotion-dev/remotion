import type {BrowserStudioServer} from '@remotion/studio-shared';

export const getBrowserStudioServer = (): BrowserStudioServer | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	return window.remotion_browserStudioServer ?? null;
};
