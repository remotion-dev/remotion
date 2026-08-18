import type {
	BuiltInEditor,
	DefaultCodingAgent,
	LogLevel,
} from '@remotion/renderer';

export type ConfigFileStudioSettings = {
	readonly askAIEnabled: boolean | null;
	readonly audioLatencyHint: AudioContextLatencyCategory | null;
	readonly beepOnFinish: boolean | null;
	readonly enableCrossSiteIsolation: boolean | null;
	readonly interactivityEnabled: boolean | null;
	readonly keyboardShortcutsEnabled: boolean | null;
	readonly logLevel: LogLevel | null;
	readonly maxTimelineTracks: number | null;
	readonly numberOfSharedAudioTags: number | null;
	readonly rspack: boolean | null;
};

export type StudioRuntimeConfig = {
	readonly maxTimelineTracks: number | null;
	readonly askAIEnabled: boolean;
	readonly interactivityEnabled: boolean;
	readonly keyboardShortcutsEnabled: boolean;
	readonly bufferStateDelayInMilliseconds: number | null;
	readonly defaultCodingAgent: DefaultCodingAgent | null;
	readonly defaultEditor: BuiltInEditor | 'custom' | null;
	readonly publicLicenseKey: string | null;
	readonly configFileStudioSettings: ConfigFileStudioSettings | null;
};
