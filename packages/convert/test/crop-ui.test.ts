import {expect, test} from 'bun:test';
import {moveCropRect} from '../app/components/crop-ui/move-crop-rect';

test('keeps crop area size when moving a crop made from the left edge', () => {
	const movedRect = moveCropRect({
		previousRect: {
			left: 300,
			top: 0,
			width: Infinity,
			height: Infinity,
		},
		visibleRect: {
			left: 300,
			top: 0,
			width: 1620,
			height: 1080,
		},
		left: 0,
		top: 0,
	});

	expect(movedRect).toEqual({
		left: 0,
		top: 0,
		width: 1620,
		height: 1080,
	});

	expect(1920 - (movedRect.left + movedRect.width)).toBe(300);
});
