import type {RenderJob} from '@remotion/studio-shared';
import {showNotification} from '../Notifications/NotificationCenter';
import {cancelRenderJob} from './actions';
import type {AnyRenderJob} from './context';

export type RenderCancellationResult =
	| {status: 'requested' | 'already-pending' | 'not-cancellable' | 'not-found'}
	| {status: 'error'; reason: string};

export const createRenderCancellationStore = ({
	getJobs,
	cancelClientJob,
	canCancelServerJobs,
}: {
	getJobs: () => readonly AnyRenderJob[];
	cancelClientJob: (jobId: string) => void;
	canCancelServerJobs: () => boolean;
}) => {
	const pending = new Map<string, object>();
	const listeners = new Map<string, Set<() => void>>();
	const getJob = (jobId: string) => getJobs().find((job) => job.id === jobId);
	const isActive = (job: AnyRenderJob | undefined) =>
		job?.status === 'idle' || job?.status === 'running';
	const notify = (jobId: string) => {
		for (const listener of listeners.get(jobId) ?? []) listener();
	};

	const clear = (jobId: string, owner: object) => {
		if (pending.get(jobId) !== owner) return;
		pending.delete(jobId);
		notify(jobId);
	};

	const isLocal = (job: AnyRenderJob) =>
		job.type === 'client-still' || job.type === 'client-video';
	const canCancelJob = (jobId: string) => {
		const job = getJob(jobId);
		return (
			Boolean(job) &&
			isActive(job) &&
			!pending.has(jobId) &&
			(isLocal(job) || canCancelServerJobs())
		);
	};

	return {
		getJobs,
		canCancelJob,
		isCancelling: (jobId: string) =>
			pending.has(jobId) && isActive(getJob(jobId)),
		subscribeToCancellation: (jobId: string, listener: () => void) => {
			const set = listeners.get(jobId) ?? new Set();
			set.add(listener);
			listeners.set(jobId, set);
			return () => {
				set.delete(listener);
				if (set.size === 0) listeners.delete(jobId);
			};
		},
		reconcile: () => {
			for (const [jobId, owner] of pending)
				if (!isActive(getJob(jobId))) clear(jobId, owner);
		},
		clear: () => {
			for (const [jobId, owner] of pending) clear(jobId, owner);
		},
		cancelJob: async (jobId: string): Promise<RenderCancellationResult> => {
			const job = getJob(jobId);
			if (!job) return {status: 'not-found'};
			if (!isActive(job)) return {status: 'not-cancellable'};
			if (pending.has(jobId)) return {status: 'already-pending'};
			if (!canCancelJob(jobId)) return {status: 'not-cancellable'};
			const owner = {};
			pending.set(jobId, owner);
			notify(jobId);
			try {
				if (isLocal(job)) cancelClientJob(jobId);
				else await cancelRenderJob(job as RenderJob);
				// Acknowledgement only means the request was accepted. The queue's
				// authoritative terminal state owns the outcome, including completion.
				if (!isActive(getJob(jobId))) clear(jobId, owner);
				return {status: 'requested'};
			} catch (error) {
				const current = pending.get(jobId) === owner;
				clear(jobId, owner);
				if (!current || !isActive(getJob(jobId)))
					return {status: 'not-cancellable'};
				const reason = error instanceof Error ? error.message : String(error);
				showNotification(`Could not cancel job: ${reason}`, 2000);
				return {status: 'error', reason};
			}
		},
	};
};
