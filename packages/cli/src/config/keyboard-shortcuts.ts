let shortcutsEnabled = true;

export const setKeyboardShortcutsEnabled = (enabled: boolean) => {
	shortcutsEnabled = enabled;
};

export const getKeyboardShortcutsEnabled = () => {
	return shortcutsEnabled;
};
