export const TIMELINE_TRIM_HANDLE_WIDTH = 8;

export const getTimelineTrimHandleLayout = ({
	leftEdge,
	rightEdge,
	rolling,
	leftTrim,
	secondary,
	rightTrim,
	nextRolling,
	activeEdge,
}: {
	readonly leftEdge: number;
	readonly rightEdge: number;
	readonly rolling: boolean;
	readonly leftTrim: boolean;
	readonly secondary: boolean;
	readonly rightTrim: boolean;
	readonly nextRolling: boolean;
	readonly activeEdge: 'left' | 'right' | 'source-only' | null;
}) => {
	const width = TIMELINE_TRIM_HANDLE_WIDTH;
	// The roll owns the cut; each adjoining trim stays on its own side.
	const rollingLeft = leftEdge - width / 2;
	const leftTrimLeft = leftEdge + (rolling ? width / 2 : 0);
	const secondaryLeft = leftTrimLeft + (leftTrim ? width : 0);
	const rightTrimLeft = rightEdge - width - (nextRolling ? width / 2 : 0);
	const availableEnd = rightEdge - (nextRolling ? width / 2 : 0);
	const rightTrimFits = rightTrim && rightTrimLeft >= leftTrimLeft;
	const leftActionsEnd = rightTrimFits ? rightTrimLeft : availableEnd;
	// Keep the wide-clip positions. Source trimming historically requires 32px;
	// narrower clips lose actions rather than shrinking or repacking their targets.
	// Keep a captured handle mounted if the drag itself makes its clip too narrow.
	return {
		rolling:
			rolling && (rightEdge - leftEdge >= width || activeEdge === 'left')
				? rollingLeft
				: null,
		leftTrim:
			leftTrim &&
			(leftTrimLeft + width <= leftActionsEnd ||
				activeEdge === 'left' ||
				activeEdge === 'source-only')
				? leftTrimLeft
				: null,
		secondary:
			secondary &&
			((rightEdge - leftEdge >= 32 &&
				secondaryLeft + width <= leftActionsEnd) ||
				activeEdge === 'source-only')
				? secondaryLeft
				: null,
		rightTrim:
			rightTrim && (rightTrimFits || activeEdge === 'right')
				? rightTrimLeft
				: null,
	};
};
