import type {
	BuiltInEditor,
	DefaultCodingAgent,
	LogLevel,
} from '@remotion/renderer';
import type {StudioKeyboardShortcuts} from './keyboard-shortcuts';

export type ConfigFileStudioSettings = {
	readonly showPremounting: boolean | null;
	readonly defaultPremountInSeconds: number | null;
	readonly askAIEnabled: boolean | null;
	readonly audioLatencyHint: AudioContextLatencyCategory | null;
	readonly beepOnFinish: boolean | null;
	readonly enableCrossSiteIsolation: boolean | null;
	readonly experimentalTracksEnabled?: boolean | null;
	readonly interactivityEnabled: boolean | null;
	readonly keyboardShortcutsEnabled: boolean | null;
	readonly logLevel: LogLevel | null;
	readonly maxTimelineTracks: number | null;
	readonly numberOfSharedAudioTags: number | null;
	readonly rspack: boolean | null;
	readonly canvasTabsEnabled: boolean | null;
};

export type StudioElementLibrary = {
	readonly displayName: string | null;
	readonly url: string;
	readonly captionStylesUrl: string | null;
};

export type StudioRuntimeConfig = {
	readonly showPremounting: boolean | null;
	readonly defaultPremountInSeconds: number | null;
	readonly maxTimelineTracks: number | null;
	readonly askAIEnabled: boolean;
	readonly elementLibraries?: readonly StudioElementLibrary[];
	readonly experimentalTracksEnabled?: boolean;
	readonly interactivityEnabled: boolean;
	readonly keyboardShortcutsEnabled: boolean;
	readonly keyboardShortcuts?: StudioKeyboardShortcuts | null;
	readonly bufferStateDelayInMilliseconds: number | null;
	readonly defaultCodingAgent: DefaultCodingAgent | null;
	readonly defaultEditor: BuiltInEditor | 'custom' | null;
	readonly publicLicenseKey: string | null;
	readonly canvasTabsEnabled: boolean | null;
	readonly configFileStudioSettings: ConfigFileStudioSettings | null;
};
