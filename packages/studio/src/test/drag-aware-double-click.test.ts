import {expect, test} from 'bun:test';
import {createDragAwareDoubleClickTracker} from '../helpers/drag-aware-double-click';

test('Drag-aware double clicks consume the drag from the current pointer gesture', () => {
	const tracker = createDragAwareDoubleClickTracker();

	tracker.beginPointerGesture({button: 0});
	tracker.endPointerGesture(true);
	expect(tracker.consumePointerGestureWasDragged()).toBe(true);
	expect(tracker.consumePointerGestureWasDragged()).toBe(false);

	tracker.beginPointerGesture({button: 0});
	tracker.endPointerGesture(true);
	tracker.beginPointerGesture({button: 0});
	tracker.endPointerGesture(false);
	expect(tracker.consumePointerGestureWasDragged()).toBe(false);
});

test('Double clicks require an even click count and two primary-button pointer gestures', () => {
	const tracker = createDragAwareDoubleClickTracker();

	tracker.beginPointerGesture({button: 2});
	tracker.beginPointerGesture({button: 0});
	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 2})).toBe(false);

	tracker.beginPointerGesture({button: 0});
	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 1})).toBe(false);
	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 2})).toBe(true);
});

test('A mixed-button click succession can recover on the next primary double click', () => {
	const tracker = createDragAwareDoubleClickTracker();

	tracker.beginPointerGesture({button: 2});
	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 2})).toBe(false);

	tracker.beginPointerGesture({button: 0});
	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 3})).toBe(false);
	tracker.beginPointerGesture({button: 0});
	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 4})).toBe(true);
});

test('A continued click succession can recover after the tracker remounts', () => {
	const tracker = createDragAwareDoubleClickTracker();

	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 2})).toBe(false);
	expect(tracker.acceptClickAsDoubleClick({button: 0, detail: 4})).toBe(true);
	expect(tracker.acceptClickAsDoubleClick({button: 2, detail: 4})).toBe(false);
});
