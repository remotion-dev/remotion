import {CanvasInternals} from '@remotion/sdk';
import {Internals} from 'remotion';
import {startErrorOverlay} from './error-overlay/entry-basic';
import {addErrorToOverlay} from './error-overlay/runtime-error-store';
import {BACKGROUND_HEX} from './helpers/colors';
import {injectCSS} from './helpers/inject-css';
import {studioCssVariables} from './helpers/studio-css-variables';
import {enableHotMiddleware} from './hot-middleware-client/client';

declare global {
	interface Window {
		__remotionOverlayStarted: boolean;
	}
}

// Initialize before the project entry point so failed imports cannot prevent
// runtime error reporting and hot reload from initializing.
export const initializeStudioPreview = () => {
	if (window.__remotionOverlayStarted) {
		return;
	}

	CanvasInternals.installReactCommitObserver(window);
	Internals.CSSUtils.injectCSS(studioCssVariables);
	Internals.CSSUtils.injectCSS(
		Internals.CSSUtils.makeDefaultPreviewCSS(null, BACKGROUND_HEX),
	);
	injectCSS();

	try {
		startErrorOverlay();
		enableHotMiddleware();
		window.__remotionOverlayStarted = true;
		for (const error of window.remotion_studioStartup?.takeErrors() ?? []) {
			addErrorToOverlay(error, null);
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Failed to initialize error overlay', err);
	}
};
