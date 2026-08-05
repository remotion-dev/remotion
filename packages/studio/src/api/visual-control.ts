import {useSyncExternalStore} from 'react';
import {getRemotionEnvironment} from 'remotion';
import {visualControlStore} from '../visual-controls/visual-control-store';
import {
	visualControlRef,
	type VisualControlRef,
} from '../visual-controls/VisualControls';

/**
 * @deprecated Remotion Studio now has integrated interactivity for most components, and we will further develop this interactivity rather than visual controls.
 */
export const visualControl: VisualControlRef['globalVisualControl'] = (
	key,
	value,
	schema,
) => {
	// Subscribe to store changes so the calling component
	// re-renders when a visual control value is edited in the sidebar.
	// eslint-disable-next-line react-hooks/rules-of-hooks
	useSyncExternalStore(
		visualControlStore.subscribe,
		visualControlStore.getSnapshot,
		visualControlStore.getSnapshot,
	);

	if (getRemotionEnvironment().isRendering) {
		return value;
	}

	if (!visualControlRef.current) {
		return value;
	}

	return visualControlRef.current.globalVisualControl(key, value, schema);
};
