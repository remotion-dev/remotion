import {expect, test} from 'bun:test';
import {validateStudioKeyboardShortcuts} from '../keyboard-shortcuts';

test('validates Studio keyboard shortcut configuration', () => {
	expect(
		validateStudioKeyboardShortcuts({
			playPause: {key: 'p'},
			quickSwitcher: {key: 'p', commandOrControl: true},
			deleteSelection: [{key: 'Backspace'}, {key: 'Delete'}],
			showKeyboardShortcuts: null,
		}),
	).toBeNull();

	expect(validateStudioKeyboardShortcuts(null)).toBe(
		'Config.setKeyboardShortcuts() expects an object.',
	);
	expect(validateStudioKeyboardShortcuts({unknown: {key: 'p'}})).toBe(
		'Unknown Studio keyboard shortcut action: "unknown".',
	);
	expect(validateStudioKeyboardShortcuts({playPause: []})).toContain(
		'must not be empty',
	);
	expect(
		validateStudioKeyboardShortcuts({
			playPause: {key: 'p', shift: 'yes'},
		}),
	).toContain('must be a boolean');
});
