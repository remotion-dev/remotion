import type {BrowserStudioOperations} from '@remotion/studio-shared';

export const getBrowserStudioOperations =
	(): BrowserStudioOperations | null => {
		if (typeof window === 'undefined') {
			return null;
		}

		return window.remotion_browserStudio ?? null;
	};
