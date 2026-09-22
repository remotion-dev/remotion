import {
	type StudioKeyboardShortcuts,
	validateStudioKeyboardShortcuts,
} from '@remotion/studio-shared';

let keyboardShortcuts: StudioKeyboardShortcuts | null = null;

export const setKeyboardShortcuts = (value: StudioKeyboardShortcuts) => {
	const error = validateStudioKeyboardShortcuts(value);
	if (error !== null) {
		throw new Error(error);
	}

	keyboardShortcuts = value;
};

export const getKeyboardShortcuts = () => keyboardShortcuts;

export const resetKeyboardShortcuts = () => {
	keyboardShortcuts = null;
};
