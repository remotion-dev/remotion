import {expect, test} from 'bun:test';
import {
	defaultKeyboardShortcuts,
	formatKeyboardShortcut,
	formatKeyboardShortcutForAria,
	keyboardEventMatchesShortcut,
	keyboardShortcutsOverlap,
} from '../components/keyboard-shortcuts';
import {isMac} from '../helpers/is-mac';

const event = (overrides: Partial<KeyboardEvent>): KeyboardEvent =>
	({
		altKey: false,
		ctrlKey: false,
		key: 'k',
		metaKey: false,
		shiftKey: false,
		...overrides,
	}) as KeyboardEvent;

test('includes the platform redo shortcuts', () => {
	expect(defaultKeyboardShortcuts.redo).toEqual(
		isMac
			? [{key: 'z', commandOrControl: true, shift: true}]
			: [
					{key: 'y', commandOrControl: true},
					{key: 'z', commandOrControl: true, shift: true},
				],
	);
});

test('includes main-row and numeric-keypad zoom-in shortcuts', () => {
	expect(defaultKeyboardShortcuts.zoomIn).toEqual([
		{key: '+', shift: true},
		{key: '+'},
	]);
});

test('matches shortcut modifiers', () => {
	expect(
		keyboardEventMatchesShortcut({
			event: event({altKey: true, key: 'a', shiftKey: true}),
			shortcut: {key: 'a'},
		}),
	).toBe(true);
	expect(
		keyboardEventMatchesShortcut({
			event: event(isMac ? {metaKey: true} : {ctrlKey: true}),
			shortcut: {key: 'k', commandOrControl: true},
		}),
	).toBe(true);
	expect(
		keyboardEventMatchesShortcut({
			event: event(
				isMac
					? {altKey: true, metaKey: true, shiftKey: true}
					: {altKey: true, ctrlKey: true, shiftKey: true},
			),
			shortcut: {key: 'k', commandOrControl: true},
		}),
	).toBe(true);
	expect(
		keyboardEventMatchesShortcut({
			event: event({key: 'k'}),
			shortcut: {key: 'k', shift: true},
		}),
	).toBe(false);
	expect(
		keyboardEventMatchesShortcut({
			event: event({key: 'k'}),
			shortcut: {alt: true, key: 'k'},
		}),
	).toBe(false);
	expect(
		keyboardEventMatchesShortcut({
			event: event({key: ' ', shiftKey: false}),
			shortcut: {key: 'Space'},
		}),
	).toBe(true);
});

test('detects overlapping shortcuts', () => {
	expect(keyboardShortcutsOverlap({key: 'a'}, {key: 'A', shift: true})).toBe(
		true,
	);
	expect(
		keyboardShortcutsOverlap({alt: true, key: 'a'}, {key: 'a', shift: true}),
	).toBe(true);
	expect(
		keyboardShortcutsOverlap({key: 'a'}, {commandOrControl: true, key: 'a'}),
	).toBe(false);
});

test('formats a shortcut for display', () => {
	expect(
		formatKeyboardShortcut({key: 'ArrowLeft', commandOrControl: true}),
	).toEqual([isMac ? '⌘' : 'Ctrl', '←']);
	expect(formatKeyboardShortcut({key: '?', shift: true})).toEqual(['?']);
	expect(formatKeyboardShortcut({key: '+', shift: true})).toEqual(['+']);
	expect(
		formatKeyboardShortcutForAria({
			key: 'k',
			commandOrControl: true,
			shift: true,
		}),
	).toBe(`${isMac ? 'Meta' : 'Control'}+Shift+k`);
});
