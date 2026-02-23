export const getDefinePluginDefinitions = ({
	maxTimelineTracks,
	askAIEnabled,
	keyboardShortcutsEnabled,
	bufferStateDelayInMilliseconds,
	experimentalClientSideRenderingEnabled,
	experimentalVisualModeEnabled,
}: {
	maxTimelineTracks: number | null;
	askAIEnabled: boolean;
	keyboardShortcutsEnabled: boolean;
	bufferStateDelayInMilliseconds: number | null;
	experimentalClientSideRenderingEnabled: boolean;
	experimentalVisualModeEnabled: boolean;
}) => ({
	'process.env.MAX_TIMELINE_TRACKS': maxTimelineTracks,
	'process.env.ASK_AI_ENABLED': askAIEnabled,
	'process.env.KEYBOARD_SHORTCUTS_ENABLED': keyboardShortcutsEnabled,
	'process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS':
		bufferStateDelayInMilliseconds,
	'process.env.EXPERIMENTAL_CLIENT_SIDE_RENDERING_ENABLED':
		experimentalClientSideRenderingEnabled,
	'process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED': experimentalVisualModeEnabled,
});
