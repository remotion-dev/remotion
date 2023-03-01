import path from 'path';
import {chalk} from '../../chalk';
import {installFileWatcher} from '../../file-watcher';
import {Log} from '../../log';
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

export const notifyClientsOfJobUpdate = () => {
	waitForLiveEventsListener().then((listener) => {
		listener.sendEventToClient({
			type: 'render-queue-updated',
			queue: getRenderQueue(),
		});
	});
};

export const processJob = async ({
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

export const processJobIfPossible = async ({
	remotionRoot,
	entryPoint,
}: {
	remotionRoot: string;
	entryPoint: string;
}) => {
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
				progress: 0,
				message: 'Starting job...',
			};
		});
		const startTime = Date.now();
		Log.info(chalk.gray('╭─ Starting render '));
		await processJob({
			job: nextJob,
			entryPoint,
			remotionRoot,
			onProgress: ({message, progress}) => {
				updateJob(nextJob.id, (job) => {
					// Ignore late callbacks of progress updates after cancelling
					if (job.status === 'failed' || job.status === 'done') {
						return job;
					}

					return {
						...job,
						status: 'running',
						progress,
						message,
					};
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
		updateJob(nextJob.id, (job) => ({
			...job,
			status: 'done',
			cleanup: [...job.cleanup, unwatch],
		}));
	} catch (err) {
		// TODO: Tell to look in preview to find the error
		Log.error(chalk.gray('╰─ Render failed:'), err);

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
};
