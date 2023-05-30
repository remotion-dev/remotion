import path from 'node:path';
import {chalk} from '../../chalk';
import {ConfigInternals} from '../../config';
import {installFileWatcher} from '../../file-watcher';
import {handleCommonError} from '../../handle-common-errors';
import {Log} from '../../log';
import type {AggregateRenderProgress} from '../../progress-types';
import {initialAggregateRenderProgress} from '../../progress-types';
import {waitForLiveEventsListener} from '../live-events';
import type {JobProgressCallback, RenderJob, RenderJobWithCleanup} from './job';
import {processStill} from './process-still';
import {processVideoJob} from './process-video';

let jobQueue: RenderJobWithCleanup[] = [];

const updateJob = (
	id: string,
	updater: (job: RenderJobWithCleanup) => RenderJobWithCleanup
) => {
	jobQueue = jobQueue.map((j) => {
		if (id === j.id) {
			return updater(j);
		}

		return j;
	});
	notifyClientsOfJobUpdate();
};

export const getRenderQueue = (): RenderJob[] => {
	return jobQueue.map((j) => {
		const {cleanup, ...rest} = j;
		return rest;
	});
};

const notifyClientsOfJobUpdate = () => {
	waitForLiveEventsListener().then((listener) => {
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
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
	onProgress: JobProgressCallback;
	addCleanupCallback: (cb: () => void) => void;
}) => {
	if (job.type === 'still') {
		await processStill({
			job,
			remotionRoot,
			entryPoint,
			onProgress,
			addCleanupCallback,
		});
		return;
	}

	if (job.type === 'video') {
		await processVideoJob({
			job,
			remotionRoot,
			entryPoint,
			onProgress,
			addCleanupCallback,
		});
		return;
	}

	throw new Error(`Unknown job ${JSON.stringify(job)}`);
};

export const addJob = ({
	job,
	entryPoint,
	remotionRoot,
}: {
	job: RenderJobWithCleanup;
	entryPoint: string;
	remotionRoot: string;
}) => {
	jobQueue.push(job);
	processJobIfPossible({entryPoint, remotionRoot});

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
			if (job.status !== 'running') {
				throw new Error('Job is not running');
			}

			job.cancelToken.cancel();
			break;
		}
	}
};

const processJobIfPossible = async ({
	remotionRoot,
	entryPoint,
}: {
	remotionRoot: string;
	entryPoint: string;
}) => {
	const runningJob = jobQueue.find((q) => {
		return q.status === 'running';
	});
	if (runningJob) {
		return;
	}

	const nextJob = jobQueue.find((q) => {
		return q.status === 'idle';
	});

	if (!nextJob) {
		return;
	}

	const jobCleanups: (() => void)[] = [];

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
		Log.info(chalk.gray('╭─ Starting render '));
		let lastProgress: AggregateRenderProgress | null = null;
		await processJob({
			job: nextJob,
			entryPoint,
			remotionRoot,
			onProgress: (progress) => {
				updateJob(nextJob.id, (job) => {
					lastProgress = progress;
					// Ignore late callbacks of progress updates after cancelling
					if (job.status === 'failed' || job.status === 'done') {
						return job;
					}

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

					throw new Error('Unknown job type');
				});
			},
			addCleanupCallback: (cleanup) => {
				jobCleanups.push(cleanup);
			},
		});
		Log.info(chalk.gray('╰─ Done in ' + (Date.now() - startTime) + 'ms.'));

		const {unwatch} = installFileWatcher({
			file: path.resolve(remotionRoot, nextJob.outName),
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
		updateJob(nextJob.id, (job) => {
			if (!lastProgress) {
				throw new Error('expected progress');
			}

			return {
				...job,
				status: 'done',
				cleanup: [...job.cleanup, unwatch],
				progress: {message: 'Done', value: 1, ...lastProgress},
			};
		});
	} catch (err) {
		Log.error(chalk.gray('╰─ '), chalk.red('Failed to render'));

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

		await handleCommonError(
			err as Error,
			ConfigInternals.Logging.getLogLevel()
		);

		waitForLiveEventsListener().then((listener) => {
			listener.sendEventToClient({
				type: 'render-job-failed',
				compositionId: nextJob.compositionId,
				error: err as Error,
			});
		});
	} finally {
		await Promise.all(jobCleanups.map((c) => c()));
	}

	processJobIfPossible({remotionRoot, entryPoint});
};
