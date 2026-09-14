import type {StudioKeyboardShortcutAction} from '@remotion/studio-shared';
import {
	getKeyboardShortcutAriaKeyShortcuts,
	getKeyboardShortcutLabel,
} from '../components/keyboard-shortcuts';
import {useStudioConfigRevision} from './client-id';

export const useKeyboardShortcutLabel = (
	action: StudioKeyboardShortcutAction,
) => {
	useStudioConfigRevision();
	return getKeyboardShortcutLabel(action);
};

export const useKeyboardShortcutAriaKeyShortcuts = (
	action: StudioKeyboardShortcutAction,
) => {
	useStudioConfigRevision();
	return getKeyboardShortcutAriaKeyShortcuts(action);
};
