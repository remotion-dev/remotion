import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	AggregateRenderProgress,
	JobProgressCallback,
	RenderJob,
	RenderJobWithCleanup,
} from '@remotion/studio-server';
import {StudioServerInternals} from '@remotion/studio-server';
import {chalk} from '../chalk';
import {Log} from '../log';
import {printError} from '../print-error';
import {initialAggregateRenderProgress} from '../progress-types';
import {processStill} from './process-still';
import {processVideoJob} from './process-video';
import type {StudioRenderJobFixedConfig} from './studio-render-job-fixed-config';

let jobQueue: RenderJobWithCleanup[] = [];
const cancellationRequests = new Set<string>();
let isProcessingJob = false;

const updateJob = (
	id: string,
	updater: (job: RenderJobWithCleanup) => RenderJobWithCleanup,
) => {
	let changed = false;
	jobQueue = jobQueue.map((j) => {
		if (id === j.id) {
			const next = updater(j);
			changed ||= next !== j;
			return next;
		}

		return j;
	});
	if (changed) notifyClientsOfJobUpdate();
};

export const getRenderQueue = (): RenderJob[] => {
	return jobQueue.map((j) => {
		const {cleanup, ...rest} = j;
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

const processJob = async ({
	job,
	remotionRoot,
	entryPoint,
	onProgress,
	addCleanupCallback,
	logLevel,
	fixedConfig,
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
	onProgress: JobProgressCallback;
	addCleanupCallback: (label: string, cb: () => void) => void;
	logLevel: LogLevel;
	fixedConfig: StudioRenderJobFixedConfig;
}) => {
	if (job.type === 'still') {
		await processStill({
			job,
			remotionRoot,
			entryPoint,
			onProgress,
			addCleanupCallback,
			fixedConfig,
		});
		return;
	}

	if (job.type === 'video' || job.type === 'sequence') {
		await processVideoJob({
			job,
			remotionRoot,
			entryPoint,
			onProgress,
			addCleanupCallback,
			logLevel,
			fixedConfig,
		});
		return;
	}

	throw new Error(`Unknown job ${JSON.stringify(job)}`);
};

export const addJob = ({
	job,
	entryPoint,
	remotionRoot,
	logLevel,
	fixedConfig,
}: {
	job: RenderJobWithCleanup;
	entryPoint: string;
	remotionRoot: string;
	logLevel: LogLevel;
	fixedConfig: StudioRenderJobFixedConfig;
}) => {
	jobQueue.push(job);
	processJobIfPossible({entryPoint, remotionRoot, logLevel, fixedConfig});

	notifyClientsOfJobUpdate();
};

export const removeJob = (jobId: string) => {
	jobQueue = jobQueue.filter((job) => {
		if (job.id === jobId) {
			job.cleanup.forEach((c) => {
				c();
			});
			return false;
		}

		return true;
	});
	notifyClientsOfJobUpdate();
};

export const cancelJob = (jobId: string) => {
	for (const job of jobQueue) {
		if (job.id === jobId) {
			if (job.status === 'idle') {
				updateJob(jobId, (queuedJob) => ({...queuedJob, status: 'cancelled'}));
				return;
			}

			if (job.status !== 'running' || cancellationRequests.has(jobId)) return;
			cancellationRequests.add(jobId);
			try {
				job.cancelToken.cancel();
			} catch (error) {
				cancellationRequests.delete(jobId);
				throw error;
			}

			return;
		}
	}
};

const processJobIfPossible = async ({
	remotionRoot,
	entryPoint,
	logLevel,
	fixedConfig,
}: {
	remotionRoot: string;
	entryPoint: string;
	logLevel: LogLevel;
	fixedConfig: StudioRenderJobFixedConfig;
}) => {
	// A terminal result may arrive before its browser and temporary files finish
	// cleaning up. Keep the queue serial until the active processor has settled.
	if (isProcessingJob) {
		return;
	}

	const nextJob = jobQueue.find((q) => {
		return q.status === 'idle';
	});

	if (!nextJob) {
		return;
	}

	isProcessingJob = true;
	const jobCleanups: {label: string; job: () => void}[] = [];

	try {
		updateJob(nextJob.id, (job) => {
			return {
				...job,
				status: 'running',
				progress: {
					value: 0,
					message: 'Starting job...',
					...initialAggregateRenderProgress(),
				},
			};
		});
		const startTime = Date.now();
		Log.info({indent: false, logLevel}, chalk.gray('╭─ Starting render '));
		let lastProgress: AggregateRenderProgress | null = null;
		await processJob({
			job: nextJob,
			entryPoint,
			remotionRoot,
			onProgress: (progress) => {
				updateJob(nextJob.id, (job) => {
					if (job.status !== 'running') {
						return job;
					}

					lastProgress = progress;
					if (cancellationRequests.has(job.id)) return job;
					if (job.type === 'still') {
						return {
							...job,
							status: 'running',
							progress,
						};
					}

					if (job.type === 'video') {
						return {
							...job,
							status: 'running',
							progress,
						};
					}

					if (job.type === 'sequence') {
						return {
							...job,
							status: 'running',
							progress,
						};
					}

					throw new Error('Unknown job type');
				});
			},
			addCleanupCallback: (label, cleanup) => {
				jobCleanups.push({label, job: cleanup});
			},
			logLevel,
			fixedConfig,
		});
		Log.info(
			{indent: false, logLevel},
			chalk.gray('╰─ Done in ' + (Date.now() - startTime) + 'ms.'),
		);

		const {unwatch} = StudioServerInternals.installFileWatcher({
			file: path.resolve(remotionRoot, nextJob.outName),
			existenceOnly: true,
			onChange: (event) => {
				if (event.type === 'created') {
					updateJob(nextJob.id, (job) => ({
						...job,
						deletedOutputLocation: false,
					}));
				}

				if (event.type === 'deleted') {
					updateJob(nextJob.id, (job) => ({
						...job,
						deletedOutputLocation: true,
					}));
				}
			},
		});
		updateJob(nextJob.id, (job) => {
			if (!lastProgress) {
				throw new Error('expected progress');
			}

			return {
				...job,
				status: 'done',
				cleanup: [...job.cleanup, unwatch],
				progress: {...lastProgress, message: 'Done', value: 1},
			};
		});
	} catch (err) {
		if (
			cancellationRequests.has(nextJob.id) &&
			RenderInternals.isUserCancelledRender(err)
		) {
			Log.info({indent: false, logLevel}, chalk.gray('╰─ Render cancelled.'));
			updateJob(nextJob.id, (job) => ({...job, status: 'cancelled'}));
			return;
		}

		Log.error(
			{indent: false, logLevel},
			chalk.gray('\n╰─ '),
			chalk.red('Failed to render'),
		);

		updateJob(nextJob.id, (job) => {
			return {
				...job,
				status: 'failed',
				error: {
					message: (err as Error).message,
					stack: (err as Error).stack,
				},
			};
		});

		await printError(err as Error, logLevel);

		StudioServerInternals.waitForLiveEventsListener().then((listener) => {
			listener.sendEventToClient({
				type: 'render-job-failed',
				compositionId: nextJob.compositionId,
				error: err as Error,
			});
		});
	} finally {
		try {
			await Promise.all(
				jobCleanups.map(({job, label}) => {
					Log.verbose({indent: false, logLevel}, 'Cleanup: ' + label);
					return job();
				}),
			);
		} finally {
			cancellationRequests.delete(nextJob.id);
			isProcessingJob = false;
			processJobIfPossible({entryPoint, remotionRoot, logLevel, fixedConfig});
		}
	}
};
