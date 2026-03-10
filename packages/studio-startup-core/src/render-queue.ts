import path from 'node:path';
import type {
	StudioBundlerAssetPaths,
	WebpackOverrideFn,
} from '@remotion/bundler';
import {BundlerInternals} from '@remotion/bundler';
import type {
	BrowserExecutable,
	BrowserLog,
	FfmpegOverrideFn,
	LogLevel,
} from '@remotion/renderer';
import {
	RenderInternals,
	renderFrames,
	renderMedia,
	renderStill,
	selectComposition,
} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import type {
	AggregateRenderProgress,
	BrowserDownloadState,
	GitSource,
	JobProgressCallback,
	RenderDefaults,
	RenderJob,
	RenderJobWithCleanup,
} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import {
	addLogToAggregateProgress,
	cloneAggregateProgress,
	initialAggregateRenderProgress,
	makeArtifactProgressHandler,
	makeBrowserDownloadProgressTracker,
	makeDownloadProgressTracker,
} from './render-progress';

type QueueContext = {
	entryPoint: string;
	remotionRoot: string;
	logLevel: LogLevel;
	rendererPort: number | null;
	browserExecutable: BrowserExecutable | null;
	ffmpegOverride: FfmpegOverrideFn | undefined;
	enableCaching: boolean;
	relativePublicDir: string | null;
	webpackOverride: WebpackOverrideFn;
	studioBundlerAssetPaths: StudioBundlerAssetPaths;
	keyboardShortcutsEnabled: boolean;
	askAIEnabled: boolean;
	maxTimelineTracks: number | null;
	bufferStateDelayInMilliseconds: number | null;
	audioLatencyHint: AudioContextLatencyCategory | null;
	experimentalClientSideRenderingEnabled: boolean;
	experimentalVisualModeEnabled: boolean;
	gitSource: GitSource | null;
	rspack: boolean;
	overrideWidth: number | null;
	overrideHeight: number | null;
	overrideFps: number | null;
	overrideDuration: number | null;
	imageSequencePattern: string | null;
	getRenderDefaults: () => RenderDefaults;
};

type RenderQueueController = {
	getRenderQueue: () => RenderJob[];
	addJob: ({
		job,
	}: {
		job: RenderJobWithCleanup;
		entryPoint: string;
		remotionRoot: string;
		logLevel: LogLevel;
	}) => void;
	removeJob: (jobId: string) => void;
	cancelJob: (jobId: string) => void;
};

const getTotalFrames = ({
	startFrame,
	endFrame,
	everyNthFrame,
}: {
	startFrame: number;
	endFrame: number;
	everyNthFrame: number;
}) => {
	return Math.floor((endFrame - startFrame) / everyNthFrame) + 1;
};

const applyCompositionOverrides = <
	T extends {
		width: number;
		height: number;
		fps: number;
		durationInFrames: number;
	},
>(
	composition: T,
	context: QueueContext,
): T => {
	return {
		...composition,
		width: context.overrideWidth ?? composition.width,
		height: context.overrideHeight ?? composition.height,
		fps: context.overrideFps ?? composition.fps,
		durationInFrames: context.overrideDuration ?? composition.durationInFrames,
	};
};

const resolveInputProps = (job: RenderJob): Record<string, unknown> => {
	return NoReactInternals.deserializeJSONWithSpecialTypes(
		job.serializedInputPropsWithCustomSchema,
	) as Record<string, unknown>;
};

const bundleProject = async ({
	context,
	renderDefaults,
	progress,
	emitProgress,
}: {
	context: QueueContext;
	renderDefaults: RenderDefaults;
	progress: AggregateRenderProgress;
	emitProgress: () => void;
}) => {
	if (RenderInternals.isServeUrl(context.entryPoint)) {
		progress.bundling = {
			progress: 1,
			doneIn: 0,
		};
		emitProgress();
		return context.entryPoint;
	}

	let copyStart: number | null = null;
	const bundleStart = Date.now();

	const bundled = await BundlerInternals.internalBundle({
		entryPoint: context.entryPoint,
		rootDir: context.remotionRoot,
		enableCaching: context.enableCaching,
		publicPath: null,
		publicDir: context.relativePublicDir,
		outDir: null,
		onProgress: (value) => {
			progress.bundling = {
				progress: value / 100,
				doneIn: null,
			};
			emitProgress();
		},
		onDirectoryCreated: () => undefined,
		gitSource: context.gitSource,
		maxTimelineTracks: context.maxTimelineTracks,
		bufferStateDelayInMilliseconds: context.bufferStateDelayInMilliseconds,
		audioLatencyHint: context.audioLatencyHint,
		experimentalClientSideRenderingEnabled:
			context.experimentalClientSideRenderingEnabled,
		experimentalVisualModeEnabled: context.experimentalVisualModeEnabled,
		renderDefaults,
		ignoreRegisterRootWarning: false,
		onPublicDirCopyProgress: (bytes) => {
			if (copyStart === null) {
				copyStart = Date.now();
			}

			progress.copyingState = {
				bytes,
				doneIn: null,
			};
			emitProgress();
		},
		onSymlinkDetected: () => undefined,
		webpackOverride: context.webpackOverride,
		keyboardShortcutsEnabled: context.keyboardShortcutsEnabled,
		askAIEnabled: context.askAIEnabled,
		rspack: context.rspack,
		studioAssetPaths: context.studioBundlerAssetPaths,
	});

	progress.bundling = {
		progress: 1,
		doneIn: Date.now() - bundleStart,
	};
	progress.copyingState = {
		...progress.copyingState,
		doneIn: copyStart === null ? 0 : Date.now() - copyStart,
	};
	emitProgress();

	return bundled;
};

const processRenderJob = async ({
	job,
	context,
	onProgress,
}: {
	job: RenderJob;
	context: QueueContext;
	onProgress: JobProgressCallback;
}) => {
	const aggregateProgress = initialAggregateRenderProgress();
	let message = 'Preparing render...';
	let value = 0;

	const emitProgress = () => {
		onProgress({
			message,
			value,
			...cloneAggregateProgress(aggregateProgress),
		});
	};

	const updateBrowser = (browser: BrowserDownloadState) => {
		aggregateProgress.browser = browser;
		emitProgress();
	};

	const inputProps = resolveInputProps(job);
	const renderDefaults = context.getRenderDefaults();

	message = 'Bundling project...';
	value = 0.02;
	emitProgress();

	const bundleDir = await bundleProject({
		context,
		renderDefaults,
		progress: aggregateProgress,
		emitProgress,
	});

	const cleanupBundle = async () => {
		if (RenderInternals.isServeUrl(bundleDir)) {
			return;
		}

		await RenderInternals.deleteDirectory(bundleDir);
	};

	try {
		message = 'Calculating composition...';
		value = 0.15;
		emitProgress();

		const selectedComposition = applyCompositionOverrides(
			await selectComposition({
				serveUrl: bundleDir,
				id: job.compositionId,
				inputProps,
				envVariables: job.envVariables,
				port: context.rendererPort,
				browserExecutable: context.browserExecutable ?? undefined,
				chromiumOptions: job.chromiumOptions,
				timeoutInMilliseconds: job.delayRenderTimeout,
				logLevel: job.logLevel,
				offthreadVideoCacheSizeInBytes:
					job.offthreadVideoCacheSizeInBytes ?? null,
				binariesDirectory: job.binariesDirectory ?? null,
				onBrowserDownload: makeBrowserDownloadProgressTracker({
					onDownloadStart: () => {
						return ({browserState}) => {
							updateBrowser(browserState);
						};
					},
				}),
				chromeMode: job.chromeMode,
				mediaCacheSizeInBytes: job.mediaCacheSizeInBytes ?? null,
				offthreadVideoThreads: job.offthreadVideoThreads ?? null,
				onBrowserLog: (browserLog: BrowserLog) => {
					addLogToAggregateProgress({
						logs: aggregateProgress.logs,
						logLogLevel: job.logLevel,
						logLevel: job.logLevel,
						previewString: browserLog.text,
						tag: browserLog.type,
					});
					emitProgress();
				},
			}),
			context,
		);

		const artifactHandler = makeArtifactProgressHandler({
			artifactState: aggregateProgress.artifactState,
			onProgress: (artifactState) => {
				aggregateProgress.artifactState = artifactState;
				emitProgress();
			},
			compositionId: job.compositionId,
			enforceOutputInsideRoot: true,
			notifyOnArtifact: true,
			notifyOnInit: false,
		});

		const onDownload = makeDownloadProgressTracker({
			downloads: aggregateProgress.downloads,
			onDownloadStart: () => {
				emitProgress();
				return () => {
					emitProgress();
				};
			},
		});

		const onBrowserDownload = makeBrowserDownloadProgressTracker({
			onDownloadStart: () => {
				return ({browserState}) => {
					updateBrowser(browserState);
				};
			},
		});

		if (job.type === 'still') {
			message = 'Rendering still...';
			value = 0.4;
			aggregateProgress.rendering = {
				frames: 0,
				totalFrames: 1,
				doneIn: null,
				timeRemainingInMilliseconds: null,
			};
			emitProgress();

			await renderStill({
				serveUrl: bundleDir,
				composition: selectedComposition,
				inputProps,
				envVariables: job.envVariables,
				port: context.rendererPort,
				output: path.resolve(process.cwd(), job.outName),
				frame: job.frame,
				overwrite: true,
				browserExecutable: context.browserExecutable ?? undefined,
				chromiumOptions: job.chromiumOptions,
				scale: job.scale,
				cancelSignal: job.cancelToken.cancelSignal,
				jpegQuality: job.jpegQuality,
				timeoutInMilliseconds: job.delayRenderTimeout,
				logLevel: job.logLevel,
				onDownload,
				onBrowserDownload,
				onArtifact: artifactHandler.onArtifact,
				chromeMode: job.chromeMode,
				offthreadVideoCacheSizeInBytes:
					job.offthreadVideoCacheSizeInBytes ?? null,
				mediaCacheSizeInBytes: job.mediaCacheSizeInBytes ?? null,
				offthreadVideoThreads: job.offthreadVideoThreads ?? null,
				licenseKey: renderDefaults.publicLicenseKey,
			});

			aggregateProgress.rendering = {
				frames: 1,
				totalFrames: 1,
				doneIn: 0,
				timeRemainingInMilliseconds: 0,
			};
			value = 1;
			message = 'Done';
			emitProgress();
			return {
				lastProgress: cloneAggregateProgress(aggregateProgress),
				cleanup: cleanupBundle,
			};
		}

		if (job.type === 'sequence') {
			const totalFrames = getTotalFrames({
				startFrame: job.startFrame,
				endFrame: job.endFrame,
				everyNthFrame: 1,
			});

			message = 'Rendering sequence...';
			value = 0.35;
			aggregateProgress.rendering = {
				frames: 0,
				totalFrames,
				doneIn: null,
				timeRemainingInMilliseconds: null,
			};
			emitProgress();

			await renderFrames({
				serveUrl: bundleDir,
				composition: selectedComposition,
				inputProps,
				envVariables: job.envVariables,
				port: context.rendererPort,
				outputDir: path.resolve(process.cwd(), job.outName),
				imageFormat: job.imageFormat,
				jpegQuality: job.jpegQuality ?? undefined,
				frameRange: [job.startFrame, job.endFrame],
				everyNthFrame: 1,
				browserExecutable: context.browserExecutable ?? undefined,
				chromiumOptions: job.chromiumOptions,
				scale: job.scale,
				cancelSignal: job.cancelToken.cancelSignal,
				timeoutInMilliseconds: job.delayRenderTimeout,
				logLevel: job.logLevel,
				muted: true,
				concurrency: job.concurrency,
				onDownload,
				onBrowserDownload,
				onArtifact: artifactHandler.onArtifact,
				chromeMode: job.chromeMode,
				offthreadVideoCacheSizeInBytes:
					job.offthreadVideoCacheSizeInBytes ?? null,
				mediaCacheSizeInBytes: job.mediaCacheSizeInBytes ?? null,
				offthreadVideoThreads: job.offthreadVideoThreads ?? null,
				binariesDirectory: job.binariesDirectory ?? null,
				imageSequencePattern: context.imageSequencePattern,
				onStart: () => undefined,
				onFrameUpdate: (framesRendered) => {
					aggregateProgress.rendering = {
						frames: framesRendered,
						totalFrames,
						doneIn: null,
						timeRemainingInMilliseconds: null,
					};
					value = 0.35 + (framesRendered / totalFrames) * 0.6;
					emitProgress();
				},
			});

			value = 1;
			message = 'Done';
			emitProgress();
			return {
				lastProgress: cloneAggregateProgress(aggregateProgress),
				cleanup: cleanupBundle,
			};
		}

		const totalFrames = getTotalFrames({
			startFrame: job.startFrame,
			endFrame: job.endFrame,
			everyNthFrame: job.everyNthFrame,
		});

		message = 'Rendering video...';
		value = 0.35;
		aggregateProgress.rendering = {
			frames: 0,
			totalFrames,
			doneIn: null,
			timeRemainingInMilliseconds: null,
		};
		emitProgress();

		await renderMedia({
			serveUrl: bundleDir,
			codec: job.codec,
			composition: selectedComposition,
			inputProps,
			crf: job.crf,
			imageFormat: job.imageFormat,
			pixelFormat: job.pixelFormat,
			envVariables: job.envVariables,
			jpegQuality: job.jpegQuality ?? undefined,
			frameRange: [job.startFrame, job.endFrame],
			everyNthFrame: job.everyNthFrame,
			outputLocation: path.resolve(process.cwd(), job.outName),
			overwrite: true,
			onProgress: (progress) => {
				aggregateProgress.rendering = {
					frames: progress.renderedFrames,
					totalFrames,
					doneIn: progress.renderedDoneIn,
					timeRemainingInMilliseconds: progress.renderEstimatedTime,
				};
				aggregateProgress.stitching = {
					frames: progress.encodedFrames,
					totalFrames,
					doneIn: progress.encodedDoneIn,
					stage: progress.stitchStage,
					codec: job.codec,
				};
				value = progress.progress;
				emitProgress();
			},
			onDownload,
			proResProfile: job.proResProfile ?? undefined,
			chromiumOptions: job.chromiumOptions,
			scale: job.scale,
			port: context.rendererPort,
			cancelSignal: job.cancelToken.cancelSignal,
			browserExecutable: context.browserExecutable ?? undefined,
			preferLossless: false,
			enforceAudioTrack: job.enforceAudioTrack,
			ffmpegOverride: context.ffmpegOverride,
			audioBitrate: job.audioBitrate as
				| `${number}k`
				| `${number}K`
				| `${number}M`
				| null,
			encodingMaxRate: job.encodingMaxRate as
				| `${number}k`
				| `${number}K`
				| `${number}M`
				| null,
			encodingBufferSize: job.encodingBufferSize as
				| `${number}k`
				| `${number}K`
				| `${number}M`
				| null,
			disallowParallelEncoding: job.disallowParallelEncoding,
			concurrency: job.concurrency,
			colorSpace: job.colorSpace,
			repro: job.repro,
			binariesDirectory: job.binariesDirectory ?? null,
			onArtifact: artifactHandler.onArtifact,
			metadata: job.metadata,
			logLevel: job.logLevel,
			muted: job.muted,
			audioCodec: job.audioCodec,
			videoBitrate: job.videoBitrate as
				| `${number}k`
				| `${number}K`
				| `${number}M`
				| null,
			onBrowserDownload,
			chromeMode: job.chromeMode,
			offthreadVideoCacheSizeInBytes:
				job.offthreadVideoCacheSizeInBytes ?? null,
			mediaCacheSizeInBytes: job.mediaCacheSizeInBytes ?? null,
			offthreadVideoThreads: job.offthreadVideoThreads ?? null,
			forSeamlessAacConcatenation: job.forSeamlessAacConcatenation,
			separateAudioTo: job.separateAudioTo,
			hardwareAcceleration: job.hardwareAcceleration,
			licenseKey: renderDefaults.publicLicenseKey,
			timeoutInMilliseconds: job.delayRenderTimeout,
			onBrowserLog: (browserLog: BrowserLog) => {
				addLogToAggregateProgress({
					logs: aggregateProgress.logs,
					logLogLevel: job.logLevel,
					logLevel: job.logLevel,
					previewString: browserLog.text,
					tag: browserLog.type,
				});
				emitProgress();
			},
		});

		value = 1;
		message = 'Done';
		emitProgress();
		return {
			lastProgress: cloneAggregateProgress(aggregateProgress),
			cleanup: cleanupBundle,
		};
	} catch (err) {
		await cleanupBundle();
		throw err;
	}
};

export const makeRenderQueue = (
	context: QueueContext,
): RenderQueueController => {
	let jobQueue: RenderJobWithCleanup[] = [];

	const getRenderQueue = (): RenderJob[] => {
		return jobQueue.map((job) => {
			const {cleanup, ...rest} = job;
			return rest;
		});
	};

	const notifyClientsOfJobUpdate = () => {
		StudioServerInternals.waitForLiveEventsListener().then((listener) => {
			listener.sendEventToClient({
				type: 'render-queue-updated',
				queue: getRenderQueue(),
			});
		});
	};

	const updateJob = (
		id: string,
		updater: (job: RenderJobWithCleanup) => RenderJobWithCleanup,
	) => {
		jobQueue = jobQueue.map((job) => {
			if (job.id !== id) {
				return job;
			}

			return updater(job);
		});
		notifyClientsOfJobUpdate();
	};

	const processNextJob = async () => {
		const runningJob = jobQueue.find((job) => job.status === 'running');
		if (runningJob) {
			return;
		}

		const nextJob = jobQueue.find((job) => job.status === 'idle');
		if (!nextJob) {
			return;
		}

		try {
			updateJob(nextJob.id, (job) => ({
				...job,
				status: 'running',
				progress: {
					value: 0,
					message: 'Starting job...',
					...initialAggregateRenderProgress(),
				},
			}));

			const {lastProgress, cleanup} = await processRenderJob({
				job: nextJob,
				context,
				onProgress: (progress) => {
					updateJob(nextJob.id, (job) => {
						if (job.status === 'failed' || job.status === 'done') {
							return job;
						}

						return {
							...job,
							status: 'running',
							progress,
						};
					});
				},
			});

			const {unwatch: outputWatcherCleanup} =
				StudioServerInternals.installFileWatcher({
					file: path.resolve(context.remotionRoot, nextJob.outName),
					onChange: (type) => {
						if (type === 'created') {
							updateJob(nextJob.id, (job) => ({
								...job,
								deletedOutputLocation: false,
							}));
						}

						if (type === 'deleted') {
							updateJob(nextJob.id, (job) => ({
								...job,
								deletedOutputLocation: true,
							}));
						}
					},
				});

			updateJob(nextJob.id, (job) => ({
				...job,
				status: 'done',
				cleanup: [...job.cleanup, outputWatcherCleanup],
				progress: {message: 'Done', value: 1, ...lastProgress},
			}));

			await cleanup();
		} catch (err) {
			updateJob(nextJob.id, (job) => ({
				...job,
				status: 'failed',
				error: {
					message: (err as Error).message,
					stack: (err as Error).stack,
				},
			}));

			RenderInternals.Log.error(
				{indent: false, logLevel: context.logLevel},
				'Failed to render',
				err,
			);

			StudioServerInternals.waitForLiveEventsListener().then((listener) => {
				listener.sendEventToClient({
					type: 'render-job-failed',
					compositionId: nextJob.compositionId,
					error: err as Error,
				});
			});
		}

		void processNextJob();
	};

	return {
		getRenderQueue,
		addJob: ({job}) => {
			jobQueue.push(job);
			notifyClientsOfJobUpdate();
			void processNextJob();
		},
		removeJob: (jobId) => {
			jobQueue = jobQueue.filter((job) => {
				if (job.id !== jobId) {
					return true;
				}

				job.cleanup.forEach((cleanup) => cleanup());
				return false;
			});
			notifyClientsOfJobUpdate();
		},
		cancelJob: (jobId) => {
			for (const job of jobQueue) {
				if (job.id === jobId && job.status === 'running') {
					job.cancelToken.cancel();
					return;
				}
			}
		},
	};
};

export type {QueueContext, RenderQueueController};
