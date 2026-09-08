export const studioKeyboardShortcutActions = [
	'playPause',
	'jumpToBeginning',
	'jumpToEnd',
	'reversePlayback',
	'pausePlayback',
	'playForward',
	'goToFrame',
	'pauseAndReturnToPlaybackStart',
	'toggleLeftSidebar',
	'toggleRightSidebar',
	'toggleBothSidebars',
	'enterFullscreen',
	'toggleSnapping',
	'previousComposition',
	'nextComposition',
	'showKeyboardShortcuts',
	'quickSwitcher',
	'render',
	'toggleCheckerboard',
	'setInPoint',
	'setOutPoint',
	'clearInOutPoints',
	'zoomIn',
	'zoomOut',
	'resetZoom',
	'undo',
	'redo',
	'selectAllSequenceRows',
	'selectTranslateProp',
	'selectOpacityProp',
	'selectRotateProp',
	'selectScaleProp',
	'duplicateSequences',
	'copyEffectsAndValues',
	'cutEffects',
	'deleteSelection',
	'askAI',
] as const;

export type StudioKeyboardShortcutAction =
	(typeof studioKeyboardShortcutActions)[number];

export type StudioKeyboardShortcut = {
	readonly key: string;
	readonly commandOrControl?: boolean;
	readonly shift?: boolean;
	readonly alt?: boolean;
};

export type StudioKeyboardShortcutValue =
	| StudioKeyboardShortcut
	| readonly StudioKeyboardShortcut[]
	| null;

export type StudioKeyboardShortcuts = Partial<
	Record<StudioKeyboardShortcutAction, StudioKeyboardShortcutValue>
>;

const actionSet = new Set<string>(studioKeyboardShortcutActions);

const validateShortcut = ({
	action,
	shortcut,
}: {
	readonly action: string;
	readonly shortcut: unknown;
}): string | null => {
	if (
		typeof shortcut !== 'object' ||
		shortcut === null ||
		Array.isArray(shortcut)
	) {
		return `The keyboard shortcut for ${JSON.stringify(action)} must be an object.`;
	}

	const value = shortcut as Record<string, unknown>;
	const allowedProperties = new Set([
		'key',
		'commandOrControl',
		'shift',
		'alt',
	]);
	for (const property of Object.keys(value)) {
		if (!allowedProperties.has(property)) {
			return `Unknown keyboard shortcut property ${JSON.stringify(property)} for ${JSON.stringify(action)}.`;
		}
	}

	if (typeof value.key !== 'string' || value.key.length === 0) {
		return `The keyboard shortcut for ${JSON.stringify(action)} must have a non-empty "key".`;
	}

	for (const modifier of ['commandOrControl', 'shift', 'alt'] as const) {
		if (value[modifier] !== undefined && typeof value[modifier] !== 'boolean') {
			return `The "${modifier}" property for ${JSON.stringify(action)} must be a boolean.`;
		}
	}

	return null;
};

export const validateStudioKeyboardShortcuts = (
	value: unknown,
): string | null => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return 'Config.setKeyboardShortcuts() expects an object.';
	}

	for (const [action, shortcutOrShortcuts] of Object.entries(value)) {
		if (!actionSet.has(action)) {
			return `Unknown Studio keyboard shortcut action: ${JSON.stringify(action)}.`;
		}

		if (shortcutOrShortcuts === null) {
			continue;
		}

		const shortcuts = Array.isArray(shortcutOrShortcuts)
			? shortcutOrShortcuts
			: [shortcutOrShortcuts];
		if (shortcuts.length === 0) {
			return `The keyboard shortcut list for ${JSON.stringify(action)} must not be empty. Use null to disable it.`;
		}

		for (const shortcut of shortcuts) {
			const error = validateShortcut({action, shortcut});
			if (error !== null) {
				return error;
			}
		}
	}

	return null;
};
