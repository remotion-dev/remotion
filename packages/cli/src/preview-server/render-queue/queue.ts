import {
	getCompositions,
	openBrowser,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import {ConfigInternals} from '../../config';
import {installFileWatcher} from '../../file-watcher';
import {getCliOptions} from '../../get-cli-options';
import {Log} from '../../log';
import {bundleOnCli} from '../../setup-cache';
import {waitForLiveEventsListener} from '../live-events';
import type {RenderJob, RenderJobWithCleanup} from './job';

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
}: {
	job: RenderJob;
	remotionRoot: string;
	entryPoint: string;
}) => {
	if (job.type === 'still') {
		const {
			publicDir,
			browserExecutable,
			ffmpegExecutable,
			ffprobeExecutable,
			chromiumOptions,
			envVariables,
			inputProps,
			port,
			scale,
			browser,
			puppeteerTimeout,
		} = await getCliOptions({
			isLambda: false,
			type: 'get-compositions',
			remotionRoot,
		});

		const browserInstance = openBrowser(browser, {
			browserExecutable,
			chromiumOptions,
			shouldDumpIo: RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'verbose'
			),
			forceDeviceScaleFactor: scale,
		});

		const serveUrl = await bundleOnCli({
			fullPath: entryPoint,
			publicDir,
			remotionRoot,
			steps: ['bundling'],
		});

		const compositions = await getCompositions(serveUrl, {
			browserExecutable,
			chromiumOptions,
			envVariables,
			ffmpegExecutable,
			ffprobeExecutable,
			inputProps,
			port,
			puppeteerInstance: await browserInstance,
			timeoutInMilliseconds: puppeteerTimeout,
		});

		const composition = compositions.find((c) => {
			return c.id === job.compositionId;
		});

		if (!composition) {
			throw new TypeError(`Composition ${job.compositionId} not found`);
		}

		await renderStill({
			composition,
			output: job.outputLocation,
			serveUrl,
			browserExecutable,
			chromiumOptions,
			envVariables,
			ffmpegExecutable,
			ffprobeExecutable,
			scale: job.scale,
			timeoutInMilliseconds: puppeteerTimeout,
			// TODO: Write download progress to CLI
			overwrite: false,
			// TODO: Allow user to overwrite file
			port,
			inputProps,
			puppeteerInstance: await browserInstance,
			quality: job.quality ?? undefined,
			imageFormat: job.imageFormat,
			frame: job.frame,

			// TODO: Allow cancel signal
			// TODO: Accept CLI options
		});
	}
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

	try {
		updateJob(nextJob.id, (job) => {
			return {
				...job,
				status: 'running',
			};
		});
		await processJob({job: nextJob, entryPoint, remotionRoot});
		const {unwatch} = installFileWatcher({
			file: nextJob.outputLocation,
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
		Log.error('Job failed: ', err);
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
	}
};
