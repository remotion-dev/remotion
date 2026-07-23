import {expect, test} from 'bun:test';
import {
	PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR,
	shouldClearSelectionOnPointerDown,
} from '../components/Timeline/should-clear-selection-on-pointer-down';

test('left pointer down clears Studio selection', () => {
	expect(shouldClearSelectionOnPointerDown({button: 0})).toBe(true);
});

test('non-left pointer down does not clear Studio selection', () => {
	expect(shouldClearSelectionOnPointerDown({button: 1})).toBe(false);
	expect(shouldClearSelectionOnPointerDown({button: 2})).toBe(false);
});

test('pointer down from a selection-clear blocker does not clear Studio selection', () => {
	const target = {
		closest: (selector: string) => {
			return selector === `[${PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR}]`
				? target
				: null;
		},
	};

	expect(
		shouldClearSelectionOnPointerDown({
			button: 0,
			target: target as unknown as EventTarget,
		}),
	).toBe(false);
});
