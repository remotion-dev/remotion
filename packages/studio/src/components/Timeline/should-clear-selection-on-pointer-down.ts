export const PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR =
	'data-remotion-prevent-selection-clear';

const isSelectionClearBlocked = (target: EventTarget | null | undefined) => {
	if (
		target === null ||
		target === undefined ||
		typeof target !== 'object' ||
		!('closest' in target) ||
		typeof target.closest !== 'function'
	) {
		return false;
	}

	return (
		target.closest(`[${PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR}]`) !== null
	);
};

export const shouldClearSelectionOnPointerDown = (event: {
	readonly button: number;
	readonly target?: EventTarget | null;
}) => {
	if (event.button !== 0) {
		return false;
	}

	return !isSelectionClearBlocked(event.target);
};
