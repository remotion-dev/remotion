import type {BuiltInEditor, DefaultCodingAgent} from '@remotion/renderer';

export type StudioRuntimeConfig = {
	readonly maxTimelineTracks: number | null;
	readonly askAIEnabled: boolean;
	readonly interactivityEnabled: boolean;
	readonly keyboardShortcutsEnabled: boolean;
	readonly bufferStateDelayInMilliseconds: number | null;
	readonly defaultCodingAgent: DefaultCodingAgent | null;
	readonly defaultEditor: BuiltInEditor | 'custom' | null;
	readonly publicLicenseKey: string | null;
};
