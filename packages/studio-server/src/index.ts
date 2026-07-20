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

import {AnsiDiff} from './ansi-diff';
import {
	addCompletedClientRender,
	getCompletedClientRenders,
	removeCompletedClientRender,
} from './client-render-queue';
import {applyCodemodToFile} from './codemods/apply-codemod-to-file';
import {
	formatOutput,
	parseAndApplyCodemod,
} from './codemods/duplicate-composition';
import {updateDefaultProps} from './codemods/update-default-props';
import {
	createFileWatcherRegistry,
	installFileWatcher,
	setFileWatcherRegistry,
	writeFileAndNotifyFileWatchers,
} from './file-watcher';
import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {
	getInstalledDependencies,
	getInstalledDependenciesWithVersions,
} from './helpers/get-installed-dependencies';
import {getInstallCommand} from './helpers/install-command';
import {
	getMaxTimelineTracks,
	resetMaxTimelineTracks,
	setMaxTimelineTracks,
} from './max-timeline-tracks';
import {
	getPackageManager,
	lockFilePaths,
} from './preview-server/get-package-manager';
import {waitForLiveEventsListener} from './preview-server/live-events';
import {getRemotionVersion} from './preview-server/update-available';
import {startStudio} from './start-studio';

export const StudioServerInternals = {
	startStudio,
	getRemotionVersion,
	waitForLiveEventsListener,
	lockFilePaths,
	getPackageManager,
	getMaxTimelineTracks,
	setMaxTimelineTracks,
	resetMaxTimelineTracks,
	getLatestRemotionVersion,
	installFileWatcher,
	writeFileAndNotifyFileWatchers,
	createFileWatcherRegistry,
	setFileWatcherRegistry,
	AnsiDiff,
	formatBytes,
	parseAndApplyCodemod,
	applyCodemodToFile,
	formatOutput,
	updateDefaultProps,
	getInstalledDependencies,
	getInstalledDependenciesWithVersions,
	getInstallCommand,
	addCompletedClientRender,
	getCompletedClientRenders,
	removeCompletedClientRender,
};
