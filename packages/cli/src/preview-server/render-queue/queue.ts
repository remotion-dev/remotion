import {
	getCompositions,
	openBrowser,
	RenderInternals,
	renderStill,
} from '@remotion/renderer';
import {ConfigInternals} from '../../config';
import {getCliOptions} from '../../get-cli-options';
import {Log} from '../../log';
import {bundleOnCli} from '../../setup-cache';
import {waitForLiveEventsListener} from '../live-events';
import type {RenderJob} from './job';

let jobQueue: RenderJob[] = [];

const updateJob = (id: string, updater: (job: RenderJob) => RenderJob) => {
	jobQueue = jobQueue.map((j) => {
		if (id === j.id) {
			return updater(j);
		}

		return j;
	});
	notifyClientsOfJobUpdate();
};

export const getRenderQueue = () => {
	return jobQueue;
};

export const notifyClientsOfJobUpdate = () => {
	waitForLiveEventsListener().then((listener) => {
		listener.sendEventToClient({
			type: 'render-queue-updated',
			queue: jobQueue,
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
			scale,
			timeoutInMilliseconds: puppeteerTimeout,
			// TODO: Write download progress to CLI
			overwrite: false,
			// TODO: Allow user to overwrite file
			port,
			inputProps,
			puppeteerInstance: await browserInstance,
			// TODO: Allow to specify quality
			// TODO: Allow to customize image format
			imageFormat: job.imageFormat,
			// TODO: Allow specific frame
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
	job: RenderJob;
	entryPoint: string;
	remotionRoot: string;
}) => {
	jobQueue.push(job);
	processJobIfPossible({entryPoint, remotionRoot});

	notifyClientsOfJobUpdate();
};

export const removeJob = (jobId: string) => {
	jobQueue = jobQueue.filter((job) => job.id !== jobId);
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
		updateJob(nextJob.id, (job) => {
			return {
				...job,
				status: 'done',
			};
		});
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
