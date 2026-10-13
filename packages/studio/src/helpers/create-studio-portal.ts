import React from 'react';
import {createPortal} from 'react-dom';
import {TimelineDomBoundary} from '../components/Timeline/timeline-scene-context';

// Portals retain their React context. Popovers opened by a canvas control must
// explicitly leave the timeline scene before rendering their visible DOM.
export const createStudioPortal: typeof createPortal = (
	children,
	container,
	key,
) => {
	return createPortal(
		React.createElement(TimelineDomBoundary, null, children),
		container,
		key,
	);
};
