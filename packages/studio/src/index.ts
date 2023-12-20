import {AnsiDiff} from './ansi/ansi-diff';
import {installFileWatcher} from './file-watcher';
import {getDefaultOutLocation} from './get-default-out-name';
import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {formatBytes} from './helpers/format-bytes';
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

export type {AnsiDiff} from './ansi/ansi-diff';
export type {EnumPath} from './components/RenderModal/SchemaEditor/extract-enum-json-paths';
export type {PackageManager} from './preview-server/get-package-manager';
export type {
	AggregateRenderProgress,
	BundlingState,
	CopyingState,
	DownloadProgress,
	JobProgressCallback,
	RenderingProgressInput,
	RenderJob,
	RenderJobWithCleanup,
	RenderStep,
	StitchingProgressInput,
} from './preview-server/job';

export const StudioInternals = {
	startStudio,
	getRemotionVersion,
	waitForLiveEventsListener,
	lockFilePaths,
	getPackageManager,
	getMaxTimelineTracks,
	setMaxTimelineTracks,
	formatBytes,
	getLatestRemotionVersion,
	getDefaultOutLocation,
	installFileWatcher,
	AnsiDiff,
};
