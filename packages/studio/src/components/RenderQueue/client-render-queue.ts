import type {
	ClientRenderJob,
	ClientRenderJobProgress,
	ClientStillRenderJob,
	ClientVideoRenderJob,
} from '@remotion/studio-shared';
import type {ComponentType} from 'react';
import type {CalculateMetadataFunction} from 'remotion';

type Listener = () => void;

export type CompositionRef = {
	component: ComponentType<Record<string, unknown>>;
	calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> | null;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	defaultProps: Record<string, unknown>;
};

const compositionRegistry = new Map<string, CompositionRef>();

export const registerCompositionForJob = (
	jobId: string,
	compositionRef: CompositionRef,
): void => {
	compositionRegistry.set(jobId, compositionRef);
};

export const getCompositionForJob = (
	jobId: string,
): CompositionRef | undefined => {
	return compositionRegistry.get(jobId);
};

export const cleanupCompositionForJob = (jobId: string): void => {
	compositionRegistry.delete(jobId);
};

type ClientRenderQueueState = {
	jobs: ClientRenderJob[];
	currentlyProcessing: string | null;
};

let state: ClientRenderQueueState = {
	jobs: [],
	currentlyProcessing: null,
};

const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
	listeners.forEach((listener) => listener());
};

export const subscribeToClientQueue = (listener: Listener): (() => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

export const getClientJobs = (): ClientRenderJob[] => state.jobs;

const generateJobId = (): string => {
	return `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const clientJobAbortControllers = new Map<string, AbortController>();

export const getAbortController = (jobId: string): AbortController => {
	let controller = clientJobAbortControllers.get(jobId);
	if (!controller) {
		controller = new AbortController();
		clientJobAbortControllers.set(jobId, controller);
	}

	return controller;
};

let processJobCallback: ((job: ClientRenderJob) => Promise<void>) | null = null;

export const setProcessJobCallback = (
	callback: ((job: ClientRenderJob) => Promise<void>) | null,
): void => {
	processJobCallback = callback;
	if (callback) {
		processNextJobIfPossible();
	}
};

const processNextJobIfPossible = (): void => {
	if (state.currentlyProcessing) {
		return;
	}

	const nextJob = state.jobs.find((job) => job.status === 'idle');
	if (!nextJob || !processJobCallback) {
		return;
	}

	state = {
		...state,
		currentlyProcessing: nextJob.id,
		jobs: state.jobs.map((job) =>
			job.id === nextJob.id
				? ({
						...job,
						status: 'running',
						progress: {renderedFrames: 0, encodedFrames: 0, totalFrames: 0},
					} as ClientRenderJob)
				: job,
		),
	};
	notifyListeners();
	processJobCallback(nextJob as ClientRenderJob);
};

export type AddClientStillJobParams = Omit<
	ClientStillRenderJob,
	'id' | 'startedAt' | 'status'
>;

export type AddClientVideoJobParams = Omit<
	ClientVideoRenderJob,
	'id' | 'startedAt' | 'status'
>;

export const addClientStillJob = (
	params: AddClientStillJobParams,
	compositionRef: CompositionRef,
): string => {
	const id = generateJobId();
	registerCompositionForJob(id, compositionRef);

	const newJob: ClientStillRenderJob = {
		...params,
		id,
		startedAt: Date.now(),
		status: 'idle',
	};

	state = {
		...state,
		jobs: [...state.jobs, newJob],
	};

	notifyListeners();
	processNextJobIfPossible();

	return id;
};

export const addClientVideoJob = (
	params: AddClientVideoJobParams,
	compositionRef: CompositionRef,
): string => {
	const id = generateJobId();
	registerCompositionForJob(id, compositionRef);

	const newJob: ClientVideoRenderJob = {
		...params,
		id,
		startedAt: Date.now(),
		status: 'idle',
	};

	state = {
		...state,
		jobs: [...state.jobs, newJob],
	};

	notifyListeners();
	processNextJobIfPossible();

	return id;
};

export const updateClientJobProgress = (
	jobId: string,
	progress: ClientRenderJobProgress,
): void => {
	state = {
		...state,
		jobs: state.jobs.map((job) =>
			job.id === jobId
				? ({...job, status: 'running', progress} as ClientRenderJob)
				: job,
		),
	};
	notifyListeners();
};

export const markClientJobDone = (jobId: string): void => {
	clientJobAbortControllers.delete(jobId);
	cleanupCompositionForJob(jobId);

	state = {
		...state,
		jobs: state.jobs.map((job) =>
			job.id === jobId ? ({...job, status: 'done'} as ClientRenderJob) : job,
		),
		currentlyProcessing: null,
	};
	notifyListeners();
	processNextJobIfPossible();
};

export const markClientJobFailed = (jobId: string, error: Error): void => {
	clientJobAbortControllers.delete(jobId);
	cleanupCompositionForJob(jobId);

	state = {
		...state,
		jobs: state.jobs.map((job) =>
			job.id === jobId
				? ({
						...job,
						status: 'failed',
						error: {message: error.message, stack: error.stack},
					} as ClientRenderJob)
				: job,
		),
		currentlyProcessing: null,
	};
	notifyListeners();
	processNextJobIfPossible();
};

export const removeClientJob = (jobId: string): void => {
	const jobToRemove = state.jobs.find((j) => j.id === jobId);
	if (jobToRemove?.status === 'running') {
		return;
	}

	clientJobAbortControllers.delete(jobId);
	cleanupCompositionForJob(jobId);

	state = {
		...state,
		jobs: state.jobs.filter((job) => job.id !== jobId),
	};
	notifyListeners();
};

export const cancelClientJob = (jobId: string): void => {
	const controller = clientJobAbortControllers.get(jobId);
	if (controller) {
		controller.abort();
	}
};
