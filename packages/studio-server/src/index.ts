export type {EnumPath} from './enum-path';
export {EventSourceEvent} from './event-source-events';
export {ErrorLocation} from './helpers/map-error-to-react-stack';
export {ApiRoutes} from './preview-server/api-types';
export type {PackageManager} from './preview-server/get-package-manager';
export type {
	HotMiddlewareOptions,
	ModuleMap,
} from './preview-server/hot-middleware/types';
export {
	CopyStillToClipboardRequest,
	OpenInFileExplorerRequest,
} from './preview-server/job';
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
export type {ProjectInfo} from './preview-server/project-info';
export type {
	RequiredChromiumOptions,
	UiOpenGlOptions,
} from './required-chromium-options';
export type {
	ScriptLine,
	SomeStackFrame,
	StackFrame,
	SymbolicatedStackFrame,
} from './stack-frame';

import {AnsiDiff} from './ansi-diff';
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
