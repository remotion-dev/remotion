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
import {openBrowser} from './better-opn';
import {parseAndApplyCodemod} from './codemods/duplicate-composition';
import {installFileWatcher} from './file-watcher';
import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {getInstalledDependencies} from './helpers/get-installed-dependencies';
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
import {startStudio} from './start-studio';

export const StudioServerInternals = {
	startStudio,
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
	openBrowser,
	getInstalledDependencies,
	getInstallCommand,
};
