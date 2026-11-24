import type {SettingsTab} from '../helpers/settings-tab-availability';

export type SettingDefinition = {
	readonly tab: SettingsTab;
	readonly section: string;
	readonly name: string;
	readonly description: string;
	readonly keywords: string;
	readonly documentation: string | null;
};

export const settingsCatalog = {
	interactivityEnabled: {
		tab: 'studio',
		section: 'Interface',
		name: 'Interactivity enabled',
		description:
			'Allow interactive Studio actions that edit your project code.',
		keywords: 'visual mode source editing',
		documentation: null,
	},
	canvasTabsEnabled: {
		tab: 'studio',
		section: 'Interface',
		name: 'Composition Tabs',
		description: 'Show a tab interface above the canvas.',
		keywords: 'canvas navigation',
		documentation: null,
	},
	highContrast: {
		tab: 'studio',
		section: 'Accessibility',
		name: 'High contrast',
		description: 'Increase the contrast of Studio controls and text.',
		keywords: 'accessibility appearance theme',
		documentation: null,
	},
	showLayerFrameNumbers: {
		tab: 'studio',
		section: 'Timeline',
		name: 'Layer Frame Counters',
		description: 'Show the internal time of each clip as a small label.',
		keywords: 'frames time sequence',
		documentation: null,
	},
	showPremounting: {
		tab: 'studio',
		section: 'Timeline',
		name: 'Indicate Premounting',
		description: 'Show in the timeline when a layer is mounted invisibly.',
		keywords: 'premount buffer sequence',
		documentation: 'https://www.remotion.dev/docs/player/premounting',
	},
	sequenceActivityLimit: {
		tab: 'studio',
		section: 'Timeline',
		name: 'Visualize unmounted components',
		description: 'Affects how many items you see in the timeline at once.',
		keywords: 'sequence activity limit infinity timeline',
		documentation:
			'https://www.remotion.dev/docs/studio/showing-unmounted-components',
	},
	preservePitchOnPlayback: {
		tab: 'studio',
		section: 'Playback',
		name: 'Preserve pitch',
		description:
			'Keep audio pitch unchanged when adjusting the Studio playback speed.',
		keywords: 'audio speed rate',
		documentation: null,
	},
	defaultPremountInSeconds: {
		tab: 'studio',
		section: 'Playback',
		name: 'Default Premount',
		description: 'How early layer is loaded before playback.',
		keywords: 'premount seconds buffer sequence',
		documentation: 'https://www.remotion.dev/docs/player/premounting',
	},
	audioLatencyHint: {
		tab: 'studio',
		section: 'Playback',
		name: 'Audio latency hint',
		description: 'Affects latency for after you press play.',
		keywords: 'interactive balanced playback sound',
		documentation:
			'https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#latencyhint',
	},
	numberOfSharedAudioTags: {
		tab: 'studio',
		section: 'Playback',
		name: 'Number of shared audio tags',
		description:
			'For <Html5Audio>. Activate audio tags to combat autoplay restrictions.',
		keywords: 'sound media pool',
		documentation: null,
	},
	rspack: {
		tab: 'studio',
		section: 'Development',
		name: 'Bundler',
		description: 'Changing this setting restarts Studio.',
		keywords: 'webpack rspack compiler',
		documentation: null,
	},
	enableCrossSiteIsolation: {
		tab: 'studio',
		section: 'Development',
		name: 'Cross-site isolation',
		description:
			'Needed for faster @mediabunny/prores and @remotion/whisper-web. Media from other websites may not load.',
		keywords: 'cross origin cors sharedarraybuffer coi',
		documentation:
			'https://www.remotion.dev/docs/miscellaneous/cross-origin-isolation',
	},
	logLevel: {
		tab: 'studio',
		section: 'Development',
		name: 'Log level',
		description: 'Verbosity of console output.',
		keywords: 'logging debug console verbosity',
		documentation: null,
	},
	showDiagnostics: {
		tab: 'studio',
		section: 'Debug',
		name: 'Show diagnostics',
		description: 'Diagnose playback issues due to buffering and media loading.',
		keywords: 'debug buffering performance',
		documentation: null,
	},
	codec: {
		tab: 'rendering',
		section: 'Output',
		name: 'Default codec',
		description: 'Choose the default codec for video renders.',
		keywords: 'h264 h265 prores vp8 vp9 gif encoding',
		documentation: null,
	},
	scale: {
		tab: 'rendering',
		section: 'Output',
		name: 'Default scale',
		description: 'Multiplies dimensions by this factor when rendering.',
		keywords: 'resolution size width height',
		documentation: null,
	},
	stillImageFormat: {
		tab: 'rendering',
		section: 'Output',
		name: 'Default still image format',
		description: 'Choose the default format for still image renders.',
		keywords: 'png jpeg webp image screenshot',
		documentation: null,
	},
	videoImageFormat: {
		tab: 'rendering',
		section: 'Output',
		name: 'Default video frame format',
		description:
			'Choose the image format used to capture frames for video renders.',
		keywords: 'png jpeg screenshot',
		documentation: null,
	},
	qualityControl: {
		tab: 'rendering',
		section: 'Encoding',
		name: 'Default quality control',
		description:
			'Choose whether video quality is controlled by CRF or bitrate.',
		keywords: 'crf bitrate compression',
		documentation: null,
	},
	crf: {
		tab: 'rendering',
		section: 'Encoding',
		name: 'Default CRF',
		description: 'Lower values produce higher quality and larger files.',
		keywords: 'quality compression constant rate factor',
		documentation: 'https://www.remotion.dev/docs/renderer/render-media#crf',
	},
	videoBitrate: {
		tab: 'rendering',
		section: 'Encoding',
		name: 'Default video bitrate',
		description:
			'Set the target video bitrate, for example 1M for one megabit per second.',
		keywords: 'quality compression file size',
		documentation: null,
	},
	proResProfile: {
		tab: 'rendering',
		section: 'Encoding',
		name: 'Default ProRes profile',
		description: 'Choose the encoding profile used for ProRes video.',
		keywords: 'apple prores hq proxy',
		documentation: null,
	},
	x264Preset: {
		tab: 'rendering',
		section: 'Encoding',
		name: 'Default x264 preset',
		description:
			'Choose the balance between H.264 encoding speed and compression efficiency.',
		keywords: 'h264 speed slow fast performance',
		documentation: null,
	},
	audioCodec: {
		tab: 'rendering',
		section: 'Audio',
		name: 'Default audio codec',
		description: 'By default gets matched to the container.',
		keywords: 'aac opus mp3 pcm sound',
		documentation: null,
	},
	concurrency: {
		tab: 'rendering',
		section: 'Performance',
		name: 'Default concurrency',
		description: 'Set how many frames are rendered in parallel.',
		keywords: 'cpu threads parallel speed memory',
		documentation: null,
	},
	beepOnFinish: {
		tab: 'rendering',
		section: 'Notifications',
		name: 'Beep when render finishes',
		description: 'Play a sound when a render completes.',
		keywords: 'notification audio sound',
		documentation: null,
	},
	doubleClickAction: {
		tab: 'apps',
		section: '',
		name: 'Double-click action',
		description: 'On layers, effects, and properties.',
		keywords: 'source editor coding agent copy context',
		documentation: 'https://www.remotion.dev/docs/options/double-click-action',
	},
	defaultEditor: {
		tab: 'apps',
		section: '',
		name: 'Default editor',
		description: 'Choose the editor used to open project source files.',
		keywords: 'ide vscode code app',
		documentation: null,
	},
	defaultCodingAgent: {
		tab: 'apps',
		section: '',
		name: 'Default coding agent',
		description: 'Choose the coding agent used to work on your project.',
		keywords: 'ai assistant claude codex app',
		documentation: null,
	},
	keyboardShortcutsEnabled: {
		tab: 'shortcuts',
		section: 'General',
		name: 'Keyboard shortcuts',
		description: 'Enable keyboard shortcuts in Studio.',
		keywords: 'hotkeys keybindings keyboard',
		documentation: null,
	},
} satisfies Record<string, SettingDefinition>;

export type SettingId = keyof typeof settingsCatalog;

export const settingsTabLabels: Record<SettingsTab, string> = {
	studio: 'Studio',
	rendering: 'Defaults',
	shortcuts: 'Shortcuts',
	packages: 'Packages',
	skills: 'Skills',
	models: 'Models',
	apps: 'Apps',
	license: 'License',
	updates: 'Updates',
};

export const getSettingDomId = (id: string) =>
	`remotion-setting-${encodeURIComponent(id)}`;
