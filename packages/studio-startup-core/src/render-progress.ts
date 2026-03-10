import fs from 'node:fs';
import path from 'node:path';
import type {
	LogLevel,
	OnArtifact,
	OnBrowserDownload,
	RenderMediaOnDownload,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	AggregateRenderProgress,
	ArtifactProgress,
	BrowserDownloadState,
	DownloadProgress,
} from '@remotion/studio-shared';

export function initialAggregateRenderProgress(): AggregateRenderProgress {
	return {
		rendering: null,
		browser: {
			progress: 0,
			alreadyAvailable: true,
			doneIn: null,
		},
		downloads: [],
		stitching: null,
		bundling: null,
		copyingState: {
			bytes: 0,
			doneIn: null,
		},
		artifactState: {
			received: [],
		},
		logs: [],
	};
}

export function addLogToAggregateProgress({
	logs,
	logLogLevel,
	logLevel,
	previewString,
	tag,
}: {
	logs: AggregateRenderProgress['logs'];
	logLogLevel: LogLevel;
	logLevel: LogLevel;
	previewString: string;
	tag: string | null;
}): void {
	if (RenderInternals.isEqualOrBelowLogLevel(logLevel, logLogLevel)) {
		logs.push({logLevel: logLogLevel, previewString, tag});
		if (logs.length > 3) {
			logs.shift();
		}
	}
}

export function cloneAggregateProgress(
	progress: AggregateRenderProgress,
): AggregateRenderProgress {
	return {
		...progress,
		browser: {...progress.browser},
		bundling: progress.bundling ? {...progress.bundling} : null,
		copyingState: {...progress.copyingState},
		rendering: progress.rendering ? {...progress.rendering} : null,
		stitching: progress.stitching ? {...progress.stitching} : null,
		downloads: progress.downloads.map((download) => ({...download})),
		artifactState: {
			received: progress.artifactState.received.map((artifact) => ({
				...artifact,
			})),
		},
		logs: progress.logs.map((log) => ({...log})),
	};
}

export function makeArtifactProgressHandler({
	artifactState,
	onProgress,
	compositionId,
	outputRoot = process.cwd(),
	enforceOutputInsideRoot,
	notifyOnArtifact,
	notifyOnInit,
}: {
	artifactState: ArtifactProgress;
	onProgress: (artifact: ArtifactProgress) => void;
	compositionId: string;
	outputRoot?: string;
	enforceOutputInsideRoot: boolean;
	notifyOnArtifact: boolean;
	notifyOnInit: boolean;
}): {onArtifact: OnArtifact} {
	const initialProgress = {...artifactState};

	if (notifyOnInit) {
		onProgress(initialProgress);
	}

	const onArtifact: OnArtifact = (artifact) => {
		const relativeOutputDestination = path.join(
			'out',
			compositionId,
			artifact.filename.replace('/', path.sep),
		);
		const outputPath = path.join(outputRoot, relativeOutputDestination);
		const parentDir = path.dirname(outputPath);

		if (
			enforceOutputInsideRoot &&
			!RenderInternals.isPathInside(outputRoot, outputPath)
		) {
			throw new Error(
				'Artifact output must stay inside the current working directory.',
			);
		}

		if (!fs.existsSync(parentDir)) {
			fs.mkdirSync(parentDir, {recursive: true});
		}

		const alreadyExisted = fs.existsSync(outputPath);
		fs.writeFileSync(outputPath, artifact.content as string | Uint8Array);

		initialProgress.received.push({
			absoluteOutputDestination: outputPath,
			filename: artifact.filename,
			sizeInBytes: artifact.content.length,
			alreadyExisted,
			relativeOutputDestination,
		});

		if (notifyOnArtifact) {
			onProgress({...initialProgress});
		}
	};

	return {onArtifact};
}

export function makeDownloadProgressTracker({
	downloads,
	onDownloadStart,
}: {
	downloads: DownloadProgress[];
	onDownloadStart?: (options: {
		download: DownloadProgress;
		index: number;
		src: string;
	}) =>
		| void
		| ((progress: {
				download: DownloadProgress;
				index: number;
				percent: number | null;
				downloaded: number;
				totalSize: number | null;
		  }) => void);
}): RenderMediaOnDownload {
	return (src) => {
		const download: DownloadProgress = {
			id: Math.random(),
			name: src,
			progress: 0,
			downloaded: 0,
			totalBytes: null,
		};
		const index = downloads.length;
		downloads.push(download);

		const onProgress = onDownloadStart?.({
			download,
			index,
			src,
		});

		return ({percent, downloaded, totalSize}) => {
			download.progress = percent;
			download.downloaded = downloaded;
			download.totalBytes = totalSize;
			onProgress?.({
				download,
				index,
				percent,
				downloaded,
				totalSize,
			});
		};
	};
}

type BrowserDownloadProgress = Parameters<
	ReturnType<OnBrowserDownload>['onProgress']
>[0];

export function makeBrowserDownloadProgressTracker({
	onDownloadStart,
}: {
	onDownloadStart?: (options: {
		chromeMode: Parameters<OnBrowserDownload>[0]['chromeMode'];
	}) =>
		| void
		| ((progress: {
				browserState: BrowserDownloadState;
				progress: BrowserDownloadProgress;
				chromeMode: Parameters<OnBrowserDownload>[0]['chromeMode'];
		  }) => void);
}): OnBrowserDownload {
	return ({chromeMode}) => {
		const startedAt = Date.now();
		let doneIn: number | null = null;
		const onProgress = onDownloadStart?.({chromeMode});

		return {
			version: null,
			onProgress: (progress) => {
				if (progress.percent === 1 && doneIn === null) {
					doneIn = Date.now() - startedAt;
				}

				onProgress?.({
					browserState: {
						alreadyAvailable: progress.alreadyAvailable,
						progress: progress.percent,
						doneIn,
					},
					progress,
					chromeMode,
				});
			},
		};
	};
}
