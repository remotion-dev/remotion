import {expect, test} from 'bun:test';
import {
	defaultKeyboardShortcuts,
	formatKeyboardShortcut,
	formatKeyboardShortcutForAria,
	keyboardEventMatchesShortcut,
	keyboardShortcutsOverlap,
	shortcutFromKeyboardEvent,
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

test('keeps shifted shortcuts distinct from their plain-key actions', () => {
	for (const [key, plainAction, shiftedAction] of [
		['m', 'toggleMute', 'toggleSnapping'],
		['l', 'playForward', 'toggleLoop'],
		['o', 'setOutPoint', 'toggleOutlines'],
		['r', 'render', 'toggleRulersAndGuides'],
		['r', 'selectRotateProp', 'toggleRulersAndGuides'],
	] as const) {
		const plainShortcut = defaultKeyboardShortcuts[plainAction][0];
		const shiftedShortcut = defaultKeyboardShortcuts[shiftedAction][0];
		for (const shiftKey of [false, true]) {
			const keyEvent = event({
				key: shiftKey ? key.toUpperCase() : key,
				shiftKey,
			});
			expect(
				keyboardEventMatchesShortcut({
					event: keyEvent,
					shortcut: plainShortcut,
				}),
			).toBe(!shiftKey);
			expect(
				keyboardEventMatchesShortcut({
					event: keyEvent,
					shortcut: shiftedShortcut,
				}),
			).toBe(shiftKey);
		}

		expect(keyboardShortcutsOverlap(plainShortcut, shiftedShortcut)).toBe(
			false,
		);
		const recorded = shortcutFromKeyboardEvent(event({key}))!;
		expect(keyboardShortcutsOverlap(recorded, shiftedShortcut)).toBe(false);
		expect(
			keyboardEventMatchesShortcut({
				event: event({key, altKey: true}),
				shortcut: recorded,
			}),
		).toBe(false);
	}
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
