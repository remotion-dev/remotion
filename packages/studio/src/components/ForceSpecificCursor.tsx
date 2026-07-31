import React, {useMemo} from 'react';

const ref = React.createRef<HTMLDivElement>();

const removeAutomaticCleanupListeners = () => {
	window.removeEventListener('pointerup', stopForcingSpecificCursor, true);
	window.removeEventListener('pointercancel', stopForcingSpecificCursor, true);
	window.removeEventListener('pointermove', stopIfNoButtonsArePressed, true);
	window.removeEventListener('blur', stopForcingSpecificCursor, true);
	document.removeEventListener('visibilitychange', stopIfDocumentIsHidden);
};

const stopIfNoButtonsArePressed = (event: PointerEvent) => {
	if (event.buttons === 0) {
		stopForcingSpecificCursor();
	}
};

const stopIfDocumentIsHidden = () => {
	if (document.visibilityState === 'hidden') {
		stopForcingSpecificCursor();
	}
};

export const forceSpecificCursor = (cursor: string): void => {
	if (!ref.current) {
		throw new Error('ForceSpecificCursor is not mounted');
	}

	ref.current.style.cursor = cursor;
	ref.current.style.pointerEvents = 'auto';

	// The component which initiated the drag may unmount before it gets a chance
	// to handle the end of the gesture. Keep this fallback independent from the
	// initiator so the cursor overlay can never remain stuck.
	window.addEventListener('pointerup', stopForcingSpecificCursor, true);
	window.addEventListener('pointercancel', stopForcingSpecificCursor, true);
	window.addEventListener('pointermove', stopIfNoButtonsArePressed, true);
	window.addEventListener('blur', stopForcingSpecificCursor, true);
	document.addEventListener('visibilitychange', stopIfDocumentIsHidden);
};

export const stopForcingSpecificCursor = () => {
	removeAutomaticCleanupListeners();

	if (!ref.current) {
		return;
	}

	ref.current.style.cursor = '';
	ref.current.style.pointerEvents = 'none';
};

const Z_INDEX_FORCE_SPECIFIC_CURSOR = 100;

export const ForceSpecificCursor = () => {
	const style: React.CSSProperties = useMemo(() => {
		return {
			position: 'fixed',
			inset: 0,
			zIndex: Z_INDEX_FORCE_SPECIFIC_CURSOR,
			pointerEvents: 'none' as const,
		};
	}, []);

	return <div ref={ref} style={style} />;
};
