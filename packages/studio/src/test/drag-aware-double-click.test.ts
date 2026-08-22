import {expect, test} from 'bun:test';
import {createDragAwareDoubleClickTracker} from '../helpers/drag-aware-double-click';

test('Drag-aware double clicks consume the drag from the current pointer gesture', () => {
	const tracker = createDragAwareDoubleClickTracker();

	tracker.beginPointerGesture();
	tracker.endPointerGesture(true);
	expect(tracker.consumePointerGestureWasDragged()).toBe(true);
	expect(tracker.consumePointerGestureWasDragged()).toBe(false);

	tracker.beginPointerGesture();
	tracker.endPointerGesture(true);
	tracker.beginPointerGesture();
	tracker.endPointerGesture(false);
	expect(tracker.consumePointerGestureWasDragged()).toBe(false);
});
