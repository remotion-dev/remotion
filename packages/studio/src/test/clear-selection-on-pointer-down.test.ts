import {expect, test} from 'bun:test';
import {shouldClearSelectionOnPointerDown} from '../components/Timeline/should-clear-selection-on-pointer-down';

test('left pointer down clears Studio selection', () => {
	expect(shouldClearSelectionOnPointerDown({button: 0})).toBe(true);
});

test('non-left pointer down does not clear Studio selection', () => {
	expect(shouldClearSelectionOnPointerDown({button: 1})).toBe(false);
	expect(shouldClearSelectionOnPointerDown({button: 2})).toBe(false);
});
