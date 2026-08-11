export type AlignmentDirection =
	| 'left'
	| 'center-h'
	| 'right'
	| 'top'
	| 'center-v'
	| 'bottom';

export const computeAlignedTranslate = ({
	direction,
	elementRect,
	compositionRect,
	currentTranslateX,
	currentTranslateY,
	scale,
}: {
	readonly direction: AlignmentDirection;
	readonly elementRect: DOMRect;
	readonly compositionRect: DOMRect;
	readonly currentTranslateX: number;
	readonly currentTranslateY: number;
	readonly scale: number;
}): {x: number; y: number} => {
	let deltaX = 0;
	let deltaY = 0;

	// Note: elementRect and compositionRect are in screen space (pixels).
	// We divide by scale to convert back to composition space.

	switch (direction) {
		case 'left':
			deltaX = compositionRect.left - elementRect.left;
			break;
		case 'center-h': {
			const compCenter = compositionRect.left + compositionRect.width / 2;
			const elemCenter = elementRect.left + elementRect.width / 2;
			deltaX = compCenter - elemCenter;
			break;
		}

		case 'right':
			deltaX = compositionRect.right - elementRect.right;
			break;
		case 'top':
			deltaY = compositionRect.top - elementRect.top;
			break;
		case 'center-v': {
			const compCenter = compositionRect.top + compositionRect.height / 2;
			const elemCenter = elementRect.top + elementRect.height / 2;
			deltaY = compCenter - elemCenter;
			break;
		}

		case 'bottom':
			deltaY = compositionRect.bottom - elementRect.bottom;
			break;
		default:
			break;
	}

	return {
		x: currentTranslateX + deltaX / scale,
		y: currentTranslateY + deltaY / scale,
	};
};
