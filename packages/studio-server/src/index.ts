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
import {prepareOpenTimelineImport} from './codemods/prepare-open-timeline-import';
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
import {getInstalledInstallablePackages} from './helpers/get-installed-installable-packages';
import {
	getLocalPackageOverride,
	localPackageRootKey,
} from './helpers/get-local-package-override';
import {httpGet} from './helpers/http-get';
import {getInstallCommand} from './helpers/install-command';
import {getPackageManagerSpawnOptions} from './helpers/package-manager-spawn-options';
import {installElement} from './install-element';
import {
	getConfiguredMaxTimelineTracks,
	getMaxTimelineTracks,
	resetMaxTimelineTracks,
	setMaxTimelineTracks,
} from './max-timeline-tracks';
import {
	getPackageManager,
	lockFilePaths,
} from './preview-server/get-package-manager';
import {waitForLiveEventsListener} from './preview-server/live-events';
import {replaceWithPrerenderedVideo} from './preview-server/prerendered-scene';
import {getProjectInfo} from './preview-server/project-info';
import {getElementInstallPlan} from './preview-server/routes/element-install-plan';
import {getEditorName} from './preview-server/routes/open-in-editor';
import {subscribeToSequenceNodePathMutations} from './preview-server/sequence-node-path-mutation';
import {getRemotionVersion} from './preview-server/update-available';
import {remotionSkillNames} from './remotion-skill-names';
import {startStudio} from './start-studio';

export type {
	RemotionSkillsScope,
	RemotionSkillsStatus,
} from './detect-outdated-remotion-skills';
export type {InstallElementOptions} from './install-element';
export type {RemotionSkillName} from './remotion-skill-names';
export {
	detectOutdatedRemotionSkills,
	parseRemotionSkillVersion,
	remotionSkillNames,
};

export const StudioServerInternals = {
	getProjectInfo,
	prepareOpenTimelineImport,
	startStudio,
	getRemotionVersion,
	waitForLiveEventsListener,
	lockFilePaths,
	getPackageManager,
	getMaxTimelineTracks,
	getConfiguredMaxTimelineTracks,
	setMaxTimelineTracks,
	resetMaxTimelineTracks,
	getLatestRemotionVersion,
	installFileWatcher,
	writeFileAndNotifyFileWatchers,
	createFileWatcherRegistry,
	setFileWatcherRegistry,
	AnsiDiff,
	formatBytes,
	getInstalledDependencies,
	getInstalledDependenciesWithVersions,
	getInstallCommand,
	getLocalPackageOverride,
	localPackageRootKey,
	getPackageManagerSpawnOptions,
	addCompletedClientRender,
	getCompletedClientRenders,
	removeCompletedClientRender,
	detectOutdatedRemotionSkills,
	parseRemotionSkillVersion,
	remotionSkillNames,
	getEditorName,
	replaceWithPrerenderedVideo,
	subscribeToSequenceNodePathMutations,
	installElement,
	getElementInstallPlan,
	getInstalledInstallablePackages,
	httpGet,
};
