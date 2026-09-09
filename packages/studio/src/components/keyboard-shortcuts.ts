import type {
	StudioKeyboardShortcut,
	StudioKeyboardShortcutAction,
	StudioKeyboardShortcuts,
	StudioKeyboardShortcutValue,
} from '@remotion/studio-shared';
import {isMac} from '../helpers/is-mac';
import {getStudioKeyboardShortcuts} from '../helpers/studio-runtime-config';

export type KeyboardShortcut = {
	readonly action: string;
	readonly actionId: StudioKeyboardShortcutAction | null;
	readonly fixedChords?: readonly (readonly string[])[];
	readonly fixedReason?: string;
};

export type KeyboardShortcutGroup = {
	readonly name: string;
	readonly shortcuts: readonly KeyboardShortcut[];
};

const shortcut = (
	action: string,
	actionId: StudioKeyboardShortcutAction,
): KeyboardShortcut => ({action, actionId});

const fixedShortcut = (
	action: string,
	fixedChords: readonly (readonly string[])[],
	fixedReason: string,
): KeyboardShortcut => ({action, actionId: null, fixedChords, fixedReason});

export const defaultKeyboardShortcuts: Record<
	StudioKeyboardShortcutAction,
	readonly StudioKeyboardShortcut[]
> = {
	playPause: [{key: 'Space'}],
	toggleMute: [{key: 'm', shift: false}],
	toggleLoop: [{key: 'l', shift: true}],
	jumpToBeginning: [{key: 'a'}],
	jumpToEnd: [{key: 'e'}],
	reversePlayback: [{key: 'j'}],
	pausePlayback: [{key: 'k'}],
	playForward: [{key: 'l', shift: false}],
	goToFrame: [{key: 'g'}],
	pauseAndReturnToPlaybackStart: [{key: 'Enter'}],
	toggleLeftSidebar: [{key: 'b', commandOrControl: true}],
	toggleRightSidebar: [{key: 'j', commandOrControl: true}],
	toggleBothSidebars: [{key: 'g', commandOrControl: true}],
	enterFullscreen: [{key: 'f'}],
	toggleSnapping: [{key: 'm', shift: true}],
	toggleOutlines: [{key: 'o', shift: true}],
	toggleRulersAndGuides: [{key: 'r', shift: true}],
	previousComposition: [{key: 'PageUp'}],
	nextComposition: [{key: 'PageDown'}],
	showKeyboardShortcuts: [{key: '?', shift: true}],
	quickSwitcher: [{key: 'k', commandOrControl: true}],
	render: [{key: 'r', shift: false}],
	toggleCheckerboard: [{key: 't'}],
	setInPoint: [{key: 'i'}],
	setOutPoint: [{key: 'o', shift: false}],
	clearInOutPoints: [{key: 'x'}],
	zoomIn: [{key: '+', shift: true}, {key: '+'}],
	zoomOut: [{key: '-'}],
	resetZoom: [{key: '0'}],
	undo: [{key: 'z', commandOrControl: true}],
	redo: [
		...(isMac ? [] : [{key: 'y', commandOrControl: true}]),
		{key: 'z', commandOrControl: true, shift: true},
	],
	selectAllSequenceRows: [{key: 'a', commandOrControl: true}],
	selectTranslateProp: [{key: 'p'}],
	selectOpacityProp: [{key: 't'}],
	selectRotateProp: [{key: 'r', shift: false}],
	selectScaleProp: [{key: 's'}],
	duplicateSequences: [{key: 'd', commandOrControl: true}],
	copyEffectsAndValues: [{key: 'c', commandOrControl: true}],
	cutEffects: [{key: 'x', commandOrControl: true}],
	deleteSelection: [{key: 'Backspace'}, {key: 'Delete'}],
	askAI: [{key: 'i', commandOrControl: true}],
};

export const keyboardShortcutGroups: readonly KeyboardShortcutGroup[] = [
	{
		name: 'Playback',
		shortcuts: [
			fixedShortcut(
				'1 second back',
				[['Shift', '←']],
				'Context-sensitive timeline control',
			),
			fixedShortcut(
				'Previous frame',
				[['←']],
				'Context-sensitive timeline control',
			),
			shortcut('Play / Pause', 'playPause'),
			shortcut('Mute / Unmute', 'toggleMute'),
			shortcut('Loop', 'toggleLoop'),
			fixedShortcut(
				'Next frame',
				[['→']],
				'Context-sensitive timeline control',
			),
			fixedShortcut(
				'1 second forward',
				[['Shift', '→']],
				'Context-sensitive timeline control',
			),
			shortcut('Jump to beginning', 'jumpToBeginning'),
			shortcut('Jump to end', 'jumpToEnd'),
			shortcut('Reverse playback', 'reversePlayback'),
			shortcut('Pause', 'pausePlayback'),
			shortcut('Play / Speed up', 'playForward'),
			shortcut('Go to frame', 'goToFrame'),
			shortcut(
				'Pause & return to playback start',
				'pauseAndReturnToPlaybackStart',
			),
		],
	},
	{
		name: 'Sidebar',
		shortcuts: [
			shortcut('Toggle left sidebar', 'toggleLeftSidebar'),
			shortcut('Toggle right sidebar', 'toggleRightSidebar'),
			shortcut('Toggle both sidebars', 'toggleBothSidebars'),
		],
	},
	{
		name: 'View',
		shortcuts: [
			shortcut('Enter fullscreen', 'enterFullscreen'),
			fixedShortcut('Exit fullscreen', [['Esc']], 'Handled by the browser'),
			shortcut('Enable snapping', 'toggleSnapping'),
			shortcut('Outlines', 'toggleOutlines'),
			shortcut('Rulers and guides', 'toggleRulersAndGuides'),
		],
	},
	{
		name: 'Navigation',
		shortcuts: [
			shortcut('Previous composition', 'previousComposition'),
			shortcut('Next composition', 'nextComposition'),
			shortcut('Render, unless a sequence or prop is selected', 'render'),
			shortcut(
				'Checkerboard, unless a sequence or prop is selected',
				'toggleCheckerboard',
			),
			shortcut('Show keyboard shortcuts', 'showKeyboardShortcuts'),
			shortcut('Quick Switcher', 'quickSwitcher'),
		],
	},
	{
		name: 'Playback range',
		shortcuts: [
			shortcut('Set In Point', 'setInPoint'),
			shortcut('Set Out Point', 'setOutPoint'),
			shortcut('Clear In/Out Points', 'clearInOutPoints'),
		],
	},
	{
		name: 'Zoom',
		shortcuts: [
			shortcut('Zoom in', 'zoomIn'),
			shortcut('Zoom out', 'zoomOut'),
			shortcut('Reset zoom', 'resetZoom'),
		],
	},
	{
		name: 'Props Editor',
		shortcuts: [shortcut('Undo', 'undo'), shortcut('Redo', 'redo')],
	},
	{
		name: 'Interactivity',
		shortcuts: [
			fixedShortcut(
				'Select range / axis lock drag',
				[['Shift']],
				'Gesture modifier',
			),
			fixedShortcut(
				'Toggle selection',
				[[isMac ? '⌘' : 'Ctrl']],
				'Gesture modifier',
			),
			shortcut('Select sequence rows', 'selectAllSequenceRows'),
			shortcut('Select translate prop', 'selectTranslateProp'),
			shortcut('Select opacity prop', 'selectOpacityProp'),
			shortcut('Select rotate prop', 'selectRotateProp'),
			shortcut('Select scale prop', 'selectScaleProp'),
			shortcut('Duplicate sequences', 'duplicateSequences'),
			shortcut('Copy effects / values', 'copyEffectsAndValues'),
			shortcut('Cut effects', 'cutEffects'),
			fixedShortcut(
				'Paste effects / values',
				[[isMac ? '⌘' : 'Ctrl', 'V']],
				'Handled by the browser clipboard event',
			),
			shortcut('Delete / reset selection', 'deleteSelection'),
		],
	},
];

export const askAIKeyboardShortcutGroup: KeyboardShortcutGroup = {
	name: 'AI',
	shortcuts: [shortcut('Ask AI', 'askAI')],
};

export const getKeyboardShortcutsForAction = (
	action: StudioKeyboardShortcutAction,
	configured: StudioKeyboardShortcuts | null = getStudioKeyboardShortcuts(),
): readonly StudioKeyboardShortcut[] => {
	if (
		configured !== null &&
		Object.prototype.hasOwnProperty.call(configured, action)
	) {
		const value = configured[action];
		if (value === null) {
			return [];
		}

		return Array.isArray(value)
			? value
			: [
					value as Exclude<
						StudioKeyboardShortcutValue,
						readonly StudioKeyboardShortcut[] | null
					>,
				];
	}

	return defaultKeyboardShortcuts[action];
};

const normalizeKey = (key: string) => (key === 'Space' ? ' ' : key);

export const keyboardEventMatchesShortcut = ({
	event,
	shortcut: value,
}: {
	readonly event: KeyboardEvent;
	readonly shortcut: StudioKeyboardShortcut;
}) => {
	const commandOrControl = isMac ? event.metaKey : event.ctrlKey;
	return (
		event.key.toLowerCase() === normalizeKey(value.key).toLowerCase() &&
		commandOrControl === (value.commandOrControl ?? false) &&
		(isMac ? !event.ctrlKey : !event.metaKey) &&
		(value.shift === undefined || event.shiftKey === value.shift) &&
		(value.alt === undefined || event.altKey === value.alt)
	);
};

export const keyboardShortcutsOverlap = (
	first: StudioKeyboardShortcut,
	second: StudioKeyboardShortcut,
) =>
	first.key.toLowerCase() === second.key.toLowerCase() &&
	(first.commandOrControl ?? false) === (second.commandOrControl ?? false) &&
	(first.shift === undefined ||
		second.shift === undefined ||
		first.shift === second.shift) &&
	(first.alt === undefined ||
		second.alt === undefined ||
		first.alt === second.alt);

export const keyboardEventMatchesAction = (
	event: KeyboardEvent,
	action: StudioKeyboardShortcutAction,
) =>
	getKeyboardShortcutsForAction(action).some((value) =>
		keyboardEventMatchesShortcut({event, shortcut: value}),
	);

const displayKey = (keyboardKey: string) => {
	if (keyboardKey === 'ArrowLeft') return '←';
	if (keyboardKey === 'ArrowRight') return '→';
	if (keyboardKey === 'Delete') return 'Del';
	if (keyboardKey === 'Backspace') return '⌫';
	if (keyboardKey === 'Escape') return 'Esc';
	return keyboardKey.length === 1 ? keyboardKey.toUpperCase() : keyboardKey;
};

export const formatKeyboardShortcut = (
	value: StudioKeyboardShortcut,
): readonly string[] => [
	...(value.commandOrControl ? [isMac ? '⌘' : 'Ctrl'] : []),
	...(value.alt ? [isMac ? 'Option' : 'Alt'] : []),
	...(value.shift && !['+', '?'].includes(value.key) ? ['Shift'] : []),
	displayKey(value.key),
];

export const formatKeyboardShortcutForAria = (value: StudioKeyboardShortcut) =>
	[
		...(value.commandOrControl ? [isMac ? 'Meta' : 'Control'] : []),
		...(value.alt ? ['Alt'] : []),
		...(value.shift ? ['Shift'] : []),
		value.key,
	].join('+');

export const getKeyboardShortcutLabel = (
	action: StudioKeyboardShortcutAction,
) =>
	getKeyboardShortcutsForAction(action)
		.map((value) => formatKeyboardShortcut(value).join('+'))
		.join(' / ');

export const getKeyboardShortcutAriaKeyShortcuts = (
	action: StudioKeyboardShortcutAction,
) =>
	getKeyboardShortcutsForAction(action)
		.map(formatKeyboardShortcutForAria)
		.join(' ');

export const shortcutFromKeyboardEvent = (
	event: KeyboardEvent,
): StudioKeyboardShortcut | null => {
	if (['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) {
		return null;
	}

	if (isMac ? event.ctrlKey : event.metaKey) {
		return null;
	}

	return {
		key: event.key === ' ' ? 'Space' : event.key,
		...((isMac ? event.metaKey : event.ctrlKey)
			? {commandOrControl: true}
			: {}),
		shift: event.shiftKey,
		alt: event.altKey,
	};
};
