export type StudioRuntimeConfig = {
	readonly maxTimelineTracks: number | null;
	readonly askAIEnabled: boolean;
	readonly interactivityEnabled: boolean;
	readonly keyboardShortcutsEnabled: boolean;
	readonly bufferStateDelayInMilliseconds: number | null;
};
