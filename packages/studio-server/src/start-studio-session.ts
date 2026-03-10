import type {
	StudioBundlerAssetPaths,
	WebpackOverrideFn,
} from '@remotion/bundler';
import type {
	BrowserExecutable,
	FfmpegOverrideFn,
	LogLevel,
} from '@remotion/renderer';
import type {GitSource, RenderDefaults} from '@remotion/studio-shared';
import {makeRenderQueue} from './render-queue';
import {startStudio as startStudioServer} from './start-studio';

export type StudioAssetPaths = {
	previewEntryPath: string;
	bundler: StudioBundlerAssetPaths;
};

export type StudioRuntimeSources = {
	getCurrentInputProps: () => Record<string, unknown>;
	getEnvVariables: () => Record<string, string>;
	getRenderDefaults: () => RenderDefaults;
};

export type StudioLaunchSpec = {
	entryPoint: string;
	remotionRoot: string;
	logLevel: LogLevel;
	desiredPort: number | null;
	shouldOpenBrowser: boolean;
	relativePublicDir: string | null;
	webpackOverride: WebpackOverrideFn;
	poll: number | null;
	maxTimelineTracks: number | null;
	bufferStateDelayInMilliseconds: number | null;
	keyboardShortcutsEnabled: boolean;
	experimentalClientSideRenderingEnabled: boolean;
	experimentalVisualModeEnabled: boolean;
	numberOfAudioTags: number;
	gitSource: GitSource | null;
	binariesDirectory: string | null;
	forceIPv4: boolean;
	audioLatencyHint: AudioContextLatencyCategory | null;
	enableCrossSiteIsolation: boolean;
	askAIEnabled: boolean;
	forceNew: boolean;
	rspack: boolean;
	rendererPort: number | null;
	browserExecutable: BrowserExecutable | null;
	ffmpegOverride: FfmpegOverrideFn | undefined;
	enableCaching: boolean;
	overrideWidth: number | null;
	overrideHeight: number | null;
	overrideFps: number | null;
	overrideDuration: number | null;
	imageSequencePattern: string | null;
	browserArgs: string;
	browserFlag: string;
	studioAssets: StudioAssetPaths;
};

export type LaunchStudioSessionResult =
	| {
			type: 'new-instance';
			port: number;
			close: () => Promise<void>;
			waitForExit: () => Promise<'close' | 'restart'>;
	  }
	| {
			type: 'already-running';
			port: number;
	  };

export const launchStudioSession = ({
	spec,
	runtimeSources,
}: {
	spec: StudioLaunchSpec;
	runtimeSources: StudioRuntimeSources;
}): Promise<LaunchStudioSessionResult> => {
	const renderQueue = makeRenderQueue({
		entryPoint: spec.entryPoint,
		remotionRoot: spec.remotionRoot,
		logLevel: spec.logLevel,
		rendererPort: spec.rendererPort,
		browserExecutable: spec.browserExecutable,
		ffmpegOverride: spec.ffmpegOverride,
		enableCaching: spec.enableCaching,
		relativePublicDir: spec.relativePublicDir,
		webpackOverride: spec.webpackOverride,
		studioBundlerAssetPaths: spec.studioAssets.bundler,
		keyboardShortcutsEnabled: spec.keyboardShortcutsEnabled,
		askAIEnabled: spec.askAIEnabled,
		maxTimelineTracks: spec.maxTimelineTracks,
		bufferStateDelayInMilliseconds: spec.bufferStateDelayInMilliseconds,
		audioLatencyHint: spec.audioLatencyHint,
		experimentalClientSideRenderingEnabled:
			spec.experimentalClientSideRenderingEnabled,
		experimentalVisualModeEnabled: spec.experimentalVisualModeEnabled,
		gitSource: spec.gitSource,
		rspack: spec.rspack,
		overrideWidth: spec.overrideWidth,
		overrideHeight: spec.overrideHeight,
		overrideFps: spec.overrideFps,
		overrideDuration: spec.overrideDuration,
		imageSequencePattern: spec.imageSequencePattern,
		getRenderDefaults: runtimeSources.getRenderDefaults,
	});

	return startStudioServer({
		previewEntry: spec.studioAssets.previewEntryPath,
		studioPackageAliasPath: spec.studioAssets.bundler.studioPackageAliasPath,
		browserArgs: spec.browserArgs,
		browserFlag: spec.browserFlag,
		logLevel: spec.logLevel,
		shouldOpenBrowser: spec.shouldOpenBrowser,
		fullEntryPath: spec.entryPoint,
		getCurrentInputProps: runtimeSources.getCurrentInputProps,
		getEnvVariables: runtimeSources.getEnvVariables,
		desiredPort: spec.desiredPort,
		maxTimelineTracks: spec.maxTimelineTracks,
		remotionRoot: spec.remotionRoot,
		keyboardShortcutsEnabled: spec.keyboardShortcutsEnabled,
		experimentalClientSideRenderingEnabled:
			spec.experimentalClientSideRenderingEnabled,
		experimentalVisualModeEnabled: spec.experimentalVisualModeEnabled,
		relativePublicDir: spec.relativePublicDir,
		webpackOverride: spec.webpackOverride,
		poll: spec.poll,
		getRenderDefaults: runtimeSources.getRenderDefaults,
		getRenderQueue: renderQueue.getRenderQueue,
		numberOfAudioTags: spec.numberOfAudioTags,
		queueMethods: {
			addJob: renderQueue.addJob,
			cancelJob: renderQueue.cancelJob,
			removeJob: renderQueue.removeJob,
		},
		gitSource: spec.gitSource,
		bufferStateDelayInMilliseconds: spec.bufferStateDelayInMilliseconds,
		binariesDirectory: spec.binariesDirectory,
		forceIPv4: spec.forceIPv4,
		audioLatencyHint: spec.audioLatencyHint,
		enableCrossSiteIsolation: spec.enableCrossSiteIsolation,
		askAIEnabled: spec.askAIEnabled,
		forceNew: spec.forceNew,
		rspack: spec.rspack,
	});
};

export const startStudio = launchStudioSession;
