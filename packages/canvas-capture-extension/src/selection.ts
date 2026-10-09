export type SelectionRectangle = {
	readonly left: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly width: number;
	readonly height: number;
};

export type SelectionHandle =
	| 'move'
	| 'n'
	| 'ne'
	| 'e'
	| 'se'
	| 's'
	| 'sw'
	| 'w'
	| 'nw';

export const makeSelectionRectangle = (
	startX: number,
	startY: number,
	endX: number,
	endY: number,
): SelectionRectangle => {
	const left = Math.min(startX, endX);
	const top = Math.min(startY, endY);
	const right = Math.max(startX, endX);
	const bottom = Math.max(startY, endY);
	return {
		left,
		top,
		right,
		bottom,
		width: right - left,
		height: bottom - top,
	};
};

export const dragSelectionRectangle = ({
	rect,
	handle,
	deltaX,
	deltaY,
	viewportWidth,
	viewportHeight,
	minimumWidth,
	minimumHeight,
}: {
	readonly rect: SelectionRectangle;
	readonly handle: SelectionHandle;
	readonly deltaX: number;
	readonly deltaY: number;
	readonly viewportWidth: number;
	readonly viewportHeight: number;
	readonly minimumWidth: number;
	readonly minimumHeight: number;
}): SelectionRectangle => {
	if (handle === 'move') {
		const nextLeft = Math.min(
			Math.max(0, rect.left + deltaX),
			Math.max(0, viewportWidth - rect.width),
		);
		const nextTop = Math.min(
			Math.max(0, rect.top + deltaY),
			Math.max(0, viewportHeight - rect.height),
		);
		return makeSelectionRectangle(
			nextLeft,
			nextTop,
			nextLeft + rect.width,
			nextTop + rect.height,
		);
	}

	let {left, top, right, bottom} = rect;
	if (handle.includes('w')) {
		left = Math.min(Math.max(0, left + deltaX), right - minimumWidth);
	}

	if (handle.includes('e')) {
		right = Math.max(
			Math.min(viewportWidth, right + deltaX),
			left + minimumWidth,
		);
	}

	if (handle.includes('n')) {
		top = Math.min(Math.max(0, top + deltaY), bottom - minimumHeight);
	}

	if (handle.includes('s')) {
		bottom = Math.max(
			Math.min(viewportHeight, bottom + deltaY),
			top + minimumHeight,
		);
	}

	return makeSelectionRectangle(left, top, right, bottom);
};
