export const getDefinePluginDefinitions = ({
	maxTimelineTracks,
	askAIEnabled,
	interactivityEnabled,
	keyboardShortcutsEnabled,
	bufferStateDelayInMilliseconds,
}: {
	maxTimelineTracks: number | null;
	askAIEnabled: boolean;
	interactivityEnabled: boolean;
	keyboardShortcutsEnabled: boolean;
	bufferStateDelayInMilliseconds: number | null;
}) => ({
	'process.env.MAX_TIMELINE_TRACKS': maxTimelineTracks,
	'process.env.ASK_AI_ENABLED': askAIEnabled,
	'process.env.INTERACTIVITY_ENABLED': interactivityEnabled,
	'process.env.KEYBOARD_SHORTCUTS_ENABLED': keyboardShortcutsEnabled,
	'process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS':
		bufferStateDelayInMilliseconds,
});
