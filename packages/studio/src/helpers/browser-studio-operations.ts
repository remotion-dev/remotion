import type {BrowserStudioOperations} from '@remotion/studio-shared';

// Browser Studio may be hosted by a different studio-shared version, so this
// handshake intentionally has no shared runtime import.
export const BROWSER_STUDIO_OPERATIONS_READY_EVENT =
	'remotion-browser-studio-operations-ready';

export const getBrowserStudioOperations =
	(): BrowserStudioOperations | null => {
		if (typeof window === 'undefined') {
			return null;
		}

		return window.remotion_browserStudio ?? null;
	};
