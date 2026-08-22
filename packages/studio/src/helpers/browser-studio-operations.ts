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

export const getBrowserStudioKeyframeOperations = () =>
	getBrowserStudioOperations()?.keyframes ?? null;

export const getBrowserStudioEffectOperations = () =>
	getBrowserStudioOperations()?.effects ?? null;

export const canUseKeyframeOperations = () =>
	!window.remotion_isReadOnlyStudio ||
	getBrowserStudioKeyframeOperations() !== null;

export const canUseEffectOperations = () =>
	!window.remotion_isReadOnlyStudio ||
	getBrowserStudioEffectOperations() !== null;

export const canInstallPackages = () => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations !== null) {
		return true;
	}

	return !window.remotion_isReadOnlyStudio;
};
