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
	detectOutdatedRemotionSkills,
	parseRemotionSkillVersion,
} from './detect-outdated-remotion-skills';
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
import {getPackageManagerSpawnOptions} from './helpers/package-manager-spawn-options';
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
import {getEditorName} from './preview-server/routes/open-in-editor';
import {getRemotionVersion} from './preview-server/update-available';
import {remotionSkillNames} from './remotion-skill-names';
import {startStudio} from './start-studio';

export type {
	RemotionSkillsScope,
	RemotionSkillsStatus,
} from './detect-outdated-remotion-skills';
export type {RemotionSkillName} from './remotion-skill-names';
export {
	detectOutdatedRemotionSkills,
	parseRemotionSkillVersion,
	remotionSkillNames,
};

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
	getPackageManagerSpawnOptions,
	addCompletedClientRender,
	getCompletedClientRenders,
	removeCompletedClientRender,
	detectOutdatedRemotionSkills,
	parseRemotionSkillVersion,
	remotionSkillNames,
	getEditorName,
};
