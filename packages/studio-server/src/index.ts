import {formatBytes} from '@remotion/studio-shared';
export {
	ApiRoutes,
	CopyStillToClipboardRequest,
	getDefaultOutLocation,
	OpenInFileExplorerRequest,
} from '@remotion/studio-shared';
export type {
	AggregateRenderProgress,
	BundlingState,
	CopyingState,
	DownloadProgress,
	HotMiddlewareOptions,
	JobProgressCallback,
	ModuleMap,
	PackageManager,
	ProjectInfo,
	RenderingProgressInput,
	RenderJob,
	RenderJobWithCleanup,
	RequiredChromiumOptions,
	StitchingProgressInput,
	UiOpenGlOptions,
} from '@remotion/studio-shared';
export {
	Config,
	ConfigInternals,
	type Concurrency,
	type WebpackConfiguration,
	type WebpackOverrideFn,
} from './config';
export {findEntryPoint, type EntryPointReason} from './find-entry-point';
export {getConfiguredRenderDefaults} from './get-configured-render-defaults';
export {getEnvironmentVariables} from './get-environment-variables';
export {loadConfig} from './load-config';
export {makeRenderQueue} from './render-queue';
export {
	addLogToAggregateProgress,
	cloneAggregateProgress,
	initialAggregateRenderProgress,
	makeArtifactProgressHandler,
	makeBrowserDownloadProgressTracker,
	makeDownloadProgressTracker,
} from './render-progress';
export {
	launchStudioSession,
	startStudio,
	type LaunchStudioSessionResult,
	type StudioAssetPaths,
	type StudioLaunchSpec,
	type StudioRuntimeSources,
} from './start-studio-session';

import {AnsiDiff} from './ansi-diff';
import {
	addCompletedClientRender,
	getCompletedClientRenders,
	removeCompletedClientRender,
} from './client-render-queue';
import {parseAndApplyCodemod} from './codemods/duplicate-composition';
import {installFileWatcher} from './file-watcher';
import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {
	getInstalledDependencies,
	getInstalledDependenciesWithVersions,
} from './helpers/get-installed-dependencies';
import {getInstallCommand} from './helpers/install-command';
import {
	getMaxTimelineTracks,
	setMaxTimelineTracks,
} from './max-timeline-tracks';
import {
	getPackageManager,
	lockFilePaths,
} from './preview-server/get-package-manager';
import {waitForLiveEventsListener} from './preview-server/live-events';
import {getRemotionVersion} from './preview-server/update-available';
import {startStudio as startStudioServer} from './start-studio';

export const StudioServerInternals = {
	startStudio: startStudioServer,
	getRemotionVersion,
	waitForLiveEventsListener,
	lockFilePaths,
	getPackageManager,
	getMaxTimelineTracks,
	setMaxTimelineTracks,
	getLatestRemotionVersion,
	installFileWatcher,
	AnsiDiff,
	formatBytes,
	parseAndApplyCodemod,
	getInstalledDependencies,
	getInstalledDependenciesWithVersions,
	getInstallCommand,
	addCompletedClientRender,
	getCompletedClientRenders,
	removeCompletedClientRender,
};
