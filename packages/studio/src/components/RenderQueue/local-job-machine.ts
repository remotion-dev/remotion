export type LocalJobStatus =
	| 'idle'
	| 'running'
	| 'saving'
	| 'done'
	| 'failed'
	| 'cancelled';

export type LocalJobEvent =
	| 'start'
	| 'progress'
	| 'saving'
	| 'done'
	| 'failed'
	| 'cancelled'
	| 'remove';

const LOCAL_JOB_TRANSITIONS: Record<LocalJobEvent, readonly LocalJobStatus[]> =
	{
		start: ['idle'],
		progress: ['running', 'saving'],
		saving: ['running'],
		done: ['running', 'saving'],
		failed: ['running', 'saving'],
		cancelled: ['idle', 'running', 'saving'],
		remove: ['idle', 'done', 'failed', 'cancelled'],
	};

export const canApplyLocalJobEvent = (
	status: LocalJobStatus,
	event: LocalJobEvent,
): boolean => LOCAL_JOB_TRANSITIONS[event].includes(status);

export const isLocalJobBusy = (status: LocalJobStatus) =>
	status === 'running' || status === 'saving';

export const isLocalJobActive = (status: LocalJobStatus) =>
	status === 'idle' || isLocalJobBusy(status);

export const transitionLocalJobs = <
	J extends {id: string; status: LocalJobStatus},
>(
	jobs: J[],
	jobId: string,
	event: LocalJobEvent,
	next: (job: J) => J,
): J[] => {
	const index = jobs.findIndex((j) => j.id === jobId);
	if (index === -1 || !canApplyLocalJobEvent(jobs[index].status, event)) {
		return jobs;
	}

	const copy = jobs.slice();
	copy[index] = next(jobs[index]);
	return copy;
};
