import {expect, test} from 'bun:test';
import {
	dragSelectionRectangle,
	makeSelectionRectangle,
	type SelectionHandle,
} from './selection';

const original = makeSelectionRectangle(20, 30, 120, 110);
const drag = (handle: SelectionHandle, deltaX: number, deltaY: number) =>
	dragSelectionRectangle({
		rect: original,
		handle,
		deltaX,
		deltaY,
		viewportWidth: 200,
		viewportHeight: 150,
		minimumWidth: 10,
		minimumHeight: 10,
	});

test('moving preserves the size and stops at all viewport edges', () => {
	expect(drag('move', 300, 300)).toEqual(
		makeSelectionRectangle(100, 70, 200, 150),
	);
	expect(drag('move', -300, -300)).toEqual(
		makeSelectionRectangle(0, 0, 100, 80),
	);
});

test('each edge resizes independently within the viewport and minimum size', () => {
	expect(drag('n', 50, -300)).toEqual(makeSelectionRectangle(20, 0, 120, 110));
	expect(drag('e', 300, 50)).toEqual(makeSelectionRectangle(20, 30, 200, 110));
	expect(drag('s', 50, 300)).toEqual(makeSelectionRectangle(20, 30, 120, 150));
	expect(drag('w', 300, 50)).toEqual(makeSelectionRectangle(110, 30, 120, 110));
});

test('corner resizing changes both axes without crossing the opposite corner', () => {
	expect(drag('nw', 300, 300)).toEqual(
		makeSelectionRectangle(110, 100, 120, 110),
	);
	expect(drag('se', -300, -300)).toEqual(
		makeSelectionRectangle(20, 30, 30, 40),
	);
	expect(drag('ne', 300, -300)).toEqual(
		makeSelectionRectangle(20, 0, 200, 110),
	);
	expect(drag('sw', -300, 300)).toEqual(
		makeSelectionRectangle(0, 30, 120, 150),
	);
});
