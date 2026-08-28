import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {isMac} from '../helpers/is-mac';

export type KeyboardShortcut = {
	readonly action: string;
	readonly chords: readonly (readonly string[])[];
};

export type KeyboardShortcutGroup = {
	readonly name: string;
	readonly shortcuts: readonly KeyboardShortcut[];
};

export const keyboardShortcutGroups: readonly KeyboardShortcutGroup[] = [
	{
		name: 'Playback',
		shortcuts: [
			{action: '1 second back', chords: [['Shift', '←']]},
			{action: 'Previous frame', chords: [['←']]},
			{action: 'Play / Pause', chords: [['Space']]},
			{action: 'Next frame', chords: [['→']]},
			{action: '1 second forward', chords: [['Shift', '→']]},
			{action: 'Jump to beginning', chords: [['A']]},
			{action: 'Jump to end', chords: [['E']]},
			{action: 'Reverse playback', chords: [['J']]},
			{action: 'Pause', chords: [['K']]},
			{action: 'Play / Speed up', chords: [['L']]},
			{action: 'Go to frame', chords: [['G']]},
			{
				action: 'Pause & return to playback start',
				chords: [['Enter']],
			},
		],
	},
	{
		name: 'Sidebar',
		shortcuts: [
			{
				action: 'Toggle left sidebar',
				chords: [[cmdOrCtrlCharacter, 'B']],
			},
			{
				action: 'Toggle right sidebar',
				chords: [[cmdOrCtrlCharacter, 'J']],
			},
			{
				action: 'Toggle both sidebars',
				chords: [[cmdOrCtrlCharacter, 'G']],
			},
		],
	},
	{
		name: 'View',
		shortcuts: [
			{action: 'Enter fullscreen', chords: [['F']]},
			{action: 'Exit fullscreen', chords: [['Esc']]},
			{action: 'Enable snapping', chords: [['Shift', 'M']]},
		],
	},
	{
		name: 'Navigation',
		shortcuts: [
			{action: 'Previous composition', chords: [['PageUp']]},
			{action: 'Next composition', chords: [['PageDown']]},
			{
				action: 'Render, unless a sequence or prop is selected',
				chords: [['R']],
			},
			{
				action: 'Checkerboard, unless a sequence or prop is selected',
				chords: [['T']],
			},
			{action: 'Show keyboard shortcuts', chords: [['?']]},
			{
				action: 'Quick Switcher',
				chords: [[cmdOrCtrlCharacter, 'K']],
			},
		],
	},
	{
		name: 'Playback range',
		shortcuts: [
			{action: 'Set In Point', chords: [['I']]},
			{action: 'Set Out Point', chords: [['O']]},
			{action: 'Clear In/Out Points', chords: [['X']]},
		],
	},
	{
		name: 'Zoom',
		shortcuts: [
			{action: 'Zoom in', chords: [['+']]},
			{action: 'Zoom out', chords: [['-']]},
			{action: 'Reset zoom', chords: [['0']]},
		],
	},
	{
		name: 'Props Editor',
		shortcuts: [
			{action: 'Undo', chords: [[cmdOrCtrlCharacter, 'Z']]},
			{
				action: 'Redo',
				chords: [
					isMac
						? [cmdOrCtrlCharacter, 'Shift', 'Z']
						: [cmdOrCtrlCharacter, 'Y'],
				],
			},
		],
	},
	{
		name: 'Interactivity',
		shortcuts: [
			{action: 'Select range / axis lock drag', chords: [['Shift']]},
			{action: 'Toggle selection', chords: [[cmdOrCtrlCharacter]]},
			{
				action: 'Select sequence rows',
				chords: [[cmdOrCtrlCharacter, 'A']],
			},
			{action: 'Select translate prop', chords: [['P']]},
			{action: 'Select opacity prop', chords: [['T']]},
			{action: 'Select rotate prop', chords: [['R']]},
			{action: 'Select scale prop', chords: [['S']]},
			{
				action: 'Duplicate sequences',
				chords: [[cmdOrCtrlCharacter, 'D']],
			},
			{
				action: 'Split sequences at playhead',
				chords: [[cmdOrCtrlCharacter, 'Shift', 'D']],
			},
			{
				action: 'Copy effects / values',
				chords: [[cmdOrCtrlCharacter, 'C']],
			},
			{action: 'Cut effects', chords: [[cmdOrCtrlCharacter, 'X']]},
			{
				action: 'Paste effects / values',
				chords: [[cmdOrCtrlCharacter, 'V']],
			},
			{action: 'Delete / reset selection', chords: [['Del'], ['⌫']]},
		],
	},
];

export const askAIKeyboardShortcutGroup: KeyboardShortcutGroup = {
	name: 'AI',
	shortcuts: [{action: 'Ask AI', chords: [[cmdOrCtrlCharacter, 'I']]}],
};
