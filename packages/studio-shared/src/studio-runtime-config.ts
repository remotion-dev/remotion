import type {
	BuiltInEditor,
	DefaultCodingAgent,
	DefaultTerminal,
} from '@remotion/renderer';

export type StudioRuntimeConfig = {
	readonly maxTimelineTracks: number | null;
	readonly askAIEnabled: boolean;
	readonly interactivityEnabled: boolean;
	readonly keyboardShortcutsEnabled: boolean;
	readonly bufferStateDelayInMilliseconds: number | null;
	readonly defaultCodingAgent: DefaultCodingAgent | null;
	readonly defaultEditor: BuiltInEditor | 'custom' | null;
	readonly defaultTerminal: DefaultTerminal | null;
	readonly publicLicenseKey: string | null;
};
