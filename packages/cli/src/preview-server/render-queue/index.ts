import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
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

export const processJob = async (job: RenderJob, entryPoint: string) => {
	if (job.type === 'still') {
		const serveUrl = await bundle({
			entryPoint,
			// TODO: Accept CLI options
		});

		const compositions = await getCompositions(serveUrl, {
			// TODO: Accept CLI option
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
			// TODO: Accept CLI options
		});
	}

	throw new TypeError(`Could not process job of type ${job.type}`);
};

export const addJob = (job: RenderJob, entryPoint: string) => {
	jobQueue.push(job);
	processJobIfPossible(entryPoint);
};

export const processJobIfPossible = async (entryPoint: string) => {
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
		await processJob(nextJob, entryPoint);
		updateJob(nextJob.id, (job) => {
			return {
				...job,
				status: 'done',
			};
		});
	} catch (err) {
		updateJob(nextJob.id, (job) => {
			return {
				...job,
				status: 'failed',
				error: err as Error,
			};
		});
	}
};
