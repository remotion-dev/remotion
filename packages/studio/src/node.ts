import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {
	ConfigInternals,
	findEntryPoint,
	getConfiguredRenderDefaults,
	getEnvironmentVariables,
	launchStudioSession,
	loadConfig,
	type StudioAssetPaths,
} from '@remotion/studio-startup-core';

type StudioSessionResult =
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

export type StudioServer =
	| {
			url: string;
			port: number;
			reusedExistingStudio: false;
			close: () => Promise<void>;
	  }
	| {
			url: string;
			port: number;
			reusedExistingStudio: true;
	  };

export type StartStudioOptions = {
	entryPoint?: string;
	remotionRoot?: string;
	logLevel?: LogLevel;
	port?: number;
	openBrowser?: boolean;
	inputProps?: Record<string, unknown>;
	envVariables?: Record<string, string>;
	publicDir?: string;
	reuseExistingStudio?: boolean;
};

type StartStudioInternalOptions = {
	entryPoint?: string;
	remotionRoot: string;
	logLevel: LogLevel;
	port?: number;
	openBrowser: boolean;
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	publicDir?: string;
	reuseExistingStudio: boolean;
};

function getStudioUrl(port: number): string {
	return `http://localhost:${port}`;
}

function getStudioAssetPaths(): StudioAssetPaths {
	return {
		previewEntryPath: require.resolve('@remotion/studio/previewEntry'),
		bundler: {
			renderEntryPath: path.join(
				require.resolve('@remotion/studio/renderEntry'),
				'..',
				'esm',
				'renderEntry.mjs',
			),
			studioPackageAliasPath: require.resolve('@remotion/studio'),
		},
	};
}

async function startStudioInternal({
	entryPoint,
	remotionRoot,
	logLevel,
	port,
	openBrowser,
	inputProps,
	envVariables,
	publicDir,
	reuseExistingStudio,
}: StartStudioInternalOptions): Promise<StudioServer> {
	await loadConfig({remotionRoot});

	const configuredEntryPoint = ConfigInternals.getEntryPoint() ?? null;
	const {file} = findEntryPoint({
		remotionRoot,
		logLevel,
		entryPoint,
		configuredEntryPoint,
		allowDirectory: false,
	});

	if (!file) {
		throw new Error(
			'No Remotion entrypoint was found. Pass `entryPoint`, for example: startStudio({entryPoint: "src/index.ts"}).',
		);
	}

	const configuredEnvVariables = getEnvironmentVariables({
		onUpdate: null,
		logLevel,
		remotionRoot,
	});

	const result: StudioSessionResult = await launchStudioSession({
		spec: {
			entryPoint: RenderInternals.isServeUrl(file) ? file : path.resolve(file),
			remotionRoot,
			logLevel,
			desiredPort: port ?? ConfigInternals.getStudioPort() ?? null,
			shouldOpenBrowser: openBrowser,
			relativePublicDir: publicDir ?? ConfigInternals.getConfiguredPublicDir(),
			webpackOverride: ConfigInternals.getWebpackOverrideFn(),
			poll: ConfigInternals.getWebpackPolling(),
			maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
			bufferStateDelayInMilliseconds:
				ConfigInternals.getBufferStateDelayInMilliseconds(),
			keyboardShortcutsEnabled:
				ConfigInternals.getConfiguredKeyboardShortcutsEnabled(),
			experimentalClientSideRenderingEnabled:
				ConfigInternals.getConfiguredExperimentalClientSideRenderingEnabled(),
			experimentalVisualModeEnabled:
				ConfigInternals.getConfiguredExperimentalVisualModeEnabled(),
			numberOfAudioTags: ConfigInternals.getConfiguredNumberOfSharedAudioTags(),
			gitSource: null,
			binariesDirectory: ConfigInternals.getConfiguredBinariesDirectory(),
			forceIPv4: ConfigInternals.getConfiguredIPv4(),
			audioLatencyHint: ConfigInternals.getConfiguredAudioLatencyHint(),
			enableCrossSiteIsolation:
				ConfigInternals.getConfiguredEnableCrossSiteIsolation(),
			askAIEnabled: ConfigInternals.getConfiguredAskAIEnabled(),
			forceNew:
				!reuseExistingStudio || ConfigInternals.getConfiguredForceNewStudio(),
			rspack: ConfigInternals.getConfiguredRspackEnabled(),
			rendererPort: ConfigInternals.getRendererPortFromConfigFile(),
			browserExecutable: ConfigInternals.getConfiguredBrowserExecutable(),
			ffmpegOverride: ConfigInternals.getFfmpegOverrideFunction(),
			enableCaching: ConfigInternals.getWebpackCaching() ?? true,
			overrideWidth: ConfigInternals.getConfiguredOverrideWidth(),
			overrideHeight: ConfigInternals.getConfiguredOverrideHeight(),
			overrideFps: ConfigInternals.getConfiguredOverrideFps(),
			overrideDuration: ConfigInternals.getConfiguredOverrideDuration(),
			imageSequencePattern: ConfigInternals.getConfiguredImageSequencePattern(),
			browserArgs: '',
			browserFlag: '',
			studioAssets: getStudioAssetPaths(),
		},
		runtimeSources: {
			getCurrentInputProps: () => inputProps,
			getEnvVariables: () => ({
				...configuredEnvVariables,
				...envVariables,
			}),
			getRenderDefaults: () => getConfiguredRenderDefaults(),
		},
	});

	if (result.type === 'already-running') {
		return {
			url: getStudioUrl(result.port),
			port: result.port,
			reusedExistingStudio: true,
		};
	}

	return {
		url: getStudioUrl(result.port),
		port: result.port,
		reusedExistingStudio: false,
		close: result.close,
	};
}

export function startStudio({
	entryPoint,
	remotionRoot = RenderInternals.findRemotionRoot(),
	logLevel = 'info',
	port,
	openBrowser = true,
	inputProps = {},
	envVariables = {},
	publicDir,
	reuseExistingStudio = true,
}: StartStudioOptions = {}): Promise<StudioServer> {
	return startStudioInternal({
		entryPoint,
		remotionRoot,
		logLevel,
		port,
		openBrowser,
		inputProps,
		envVariables,
		publicDir,
		reuseExistingStudio,
	});
}

export const StudioNodeInternals = {
	startStudio: startStudioInternal,
};
