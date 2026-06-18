import type {Size} from '@remotion/player';
import {RULER_WIDTH} from '../state/editor-rulers';

export const applyRulerInsetsToCanvasSize = ({
	rulersAreVisible,
	size,
}: {
	readonly rulersAreVisible: boolean;
	readonly size: Size;
}) => {
	if (!rulersAreVisible) {
		return size;
	}

	return {
		...size,
		left: size.left + RULER_WIDTH,
		top: size.top + RULER_WIDTH,
		width: size.width - RULER_WIDTH,
		height: size.height - RULER_WIDTH,
	};
};
