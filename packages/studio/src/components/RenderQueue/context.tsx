import type {CompletedClientRender, RenderJob} from '@remotion/studio-shared';
import React, {
	createRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	type AddClientStillJobParams,
	type AddClientVideoJobParams,
	type CompositionRef,
	cancelAbortController,
	cleanupCompositionForJob,
	deleteAbortController,
	generateJobId,
	getAbortController,
	getCompositionForJob,
	registerCompositionForJob,
} from './client-render-queue';
import type {
	ClientRenderJob,
	ClientRenderJobProgress,
	ClientStillRenderJob,
	ClientVideoRenderJob,
	GetBlobCallback,
	RestoredClientRenderJob,
} from './client-side-render-types';

declare global {
	interface Window {
		remotion_initialRenderQueue: RenderJob[] | null;
		remotion_initialClientRenders: CompletedClientRender[] | null;
	}
}

const restorePersistedClientRenders = (): RestoredClientRenderJob[] => {
	const persisted = window.remotion_initialClientRenders ?? [];
	return persisted.map(
		(r): RestoredClientRenderJob => ({...r, status: 'done'}),
	);
};

export type AnyRenderJob = RenderJob | ClientRenderJob;

export const isClientRenderJob = (
	job: AnyRenderJob,
): job is ClientRenderJob => {
	return job.type === 'client-still' || job.type === 'client-video';
};

type RenderQueueContextType = {
	jobs: AnyRenderJob[];
	serverJobs: RenderJob[];
	clientJobs: ClientRenderJob[];
	addClientStillJob: (
		params: AddClientStillJobParams,
		compositionRef: CompositionRef,
	) => string;
	addClientVideoJob: (
		params: AddClientVideoJobParams,
		compositionRef: CompositionRef,
	) => string;
	updateClientJobProgress: (
		jobId: string,
		progress: ClientRenderJobProgress,
	) => void;
	markClientJobSaving: (jobId: string) => void;
	markClientJobDone: (
		jobId: string,
		metadata: CompletedClientRender['metadata'],
		getBlob?: GetBlobCallback,
	) => void;
	markClientJobFailed: (jobId: string, error: Error) => void;
	markClientJobCancelled: (jobId: string) => void;
	removeClientJob: (jobId: string) => void;
	cancelClientJob: (jobId: string) => void;
	setProcessJobCallback: (
		callback: ((job: ClientRenderJob) => Promise<void>) | null,
	) => void;
	getAbortController: (jobId: string) => AbortController;
	getCompositionForJob: (jobId: string) => CompositionRef | undefined;
};

const noopString = () => '';
const noop = () => undefined;

export const RenderQueueContext = React.createContext<RenderQueueContextType>({
	jobs: [],
	serverJobs: [],
	clientJobs: [],
	addClientStillJob: noopString,
	addClientVideoJob: noopString,
	updateClientJobProgress: noop,
	markClientJobSaving: noop,
	markClientJobDone: noop,
	markClientJobFailed: noop,
	markClientJobCancelled: noop,
	removeClientJob: noop,
	cancelClientJob: noop,
	setProcessJobCallback: noop,
	getAbortController: () => new AbortController(),
	getCompositionForJob: () => undefined,
});

export const renderJobsRef = createRef<{
	updateRenderJobs: (jobs: RenderJob[]) => void;
	updateClientRenders: (renders: CompletedClientRender[]) => void;
}>();

export const RenderQueueContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [serverJobs, setServerJobs] = useState<RenderJob[]>(
		window.remotion_initialRenderQueue ?? [],
	);
	const [clientJobs, setClientJobs] = useState<ClientRenderJob[]>(
		restorePersistedClientRenders,
	);
	const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(
		null,
	);
	const processJobCallbackRef = useRef<
		((job: ClientRenderJob) => Promise<void>) | null
	>(null);

	// Process next job when state changes
	useEffect(() => {
		if (currentlyProcessing) {
			return;
		}

		const nextJob = clientJobs.find((job) => job.status === 'idle');
		if (!nextJob || !processJobCallbackRef.current) {
			return;
		}

		setCurrentlyProcessing(nextJob.id);
		setClientJobs((prev) =>
			prev.map((job) =>
				job.id === nextJob.id
					? ({
							...job,
							status: 'running',
							progress: {renderedFrames: 0, encodedFrames: 0, totalFrames: 0},
						} as ClientRenderJob)
					: job,
			),
		);
		processJobCallbackRef.current(nextJob);
	}, [clientJobs, currentlyProcessing]);

	const addClientStillJob = useCallback(
		(
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

			setClientJobs((prev) => [...prev, newJob]);
			return id;
		},
		[],
	);

	const addClientVideoJob = useCallback(
		(
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

			setClientJobs((prev) => [...prev, newJob]);
			return id;
		},
		[],
	);

	const updateClientJobProgress = useCallback(
		(jobId: string, progress: ClientRenderJobProgress): void => {
			setClientJobs((prev) =>
				prev.map((job) =>
					job.id === jobId
						? ({...job, status: 'running', progress} as ClientRenderJob)
						: job,
				),
			);
		},
		[],
	);

	const markClientJobSaving = useCallback((jobId: string): void => {
		setClientJobs((prev) =>
			prev.map((job) =>
				job.id === jobId
					? ({...job, status: 'saving'} as ClientRenderJob)
					: job,
			),
		);
	}, []);

	const markClientJobDone = useCallback(
		(
			jobId: string,
			metadata: CompletedClientRender['metadata'],
			getBlob?: GetBlobCallback,
		): void => {
			deleteAbortController(jobId);
			cleanupCompositionForJob(jobId);

			setClientJobs((prev) =>
				prev.map((job) =>
					job.id === jobId ? {...job, status: 'done', metadata, getBlob} : job,
				),
			);
			setCurrentlyProcessing(null);
		},
		[],
	);

	const markClientJobFailed = useCallback(
		(jobId: string, error: Error): void => {
			deleteAbortController(jobId);
			cleanupCompositionForJob(jobId);

			setClientJobs((prev) =>
				prev.map((job) =>
					job.id === jobId
						? ({
								...job,
								status: 'failed',
								error: {message: error.message, stack: error.stack},
							} as ClientRenderJob)
						: job,
				),
			);
			setCurrentlyProcessing(null);
		},
		[],
	);

	const markClientJobCancelled = useCallback((jobId: string): void => {
		deleteAbortController(jobId);
		cleanupCompositionForJob(jobId);

		setClientJobs((prev) =>
			prev.map((job) =>
				job.id === jobId
					? ({
							...job,
							status: 'cancelled',
						} as ClientRenderJob)
					: job,
			),
		);
		setCurrentlyProcessing(null);
	}, []);

	const removeClientJob = useCallback((jobId: string): void => {
		setClientJobs((prev) => {
			const jobToRemove = prev.find((j) => j.id === jobId);
			if (jobToRemove?.status === 'running') {
				return prev;
			}

			deleteAbortController(jobId);
			cleanupCompositionForJob(jobId);
			return prev.filter((job) => job.id !== jobId);
		});
	}, []);

	const cancelClientJob = useCallback((jobId: string): void => {
		cancelAbortController(jobId);
	}, []);

	const setProcessJobCallback = useCallback(
		(callback: ((job: ClientRenderJob) => Promise<void>) | null): void => {
			processJobCallbackRef.current = callback;
		},
		[],
	);

	useImperativeHandle(
		renderJobsRef,
		() => ({
			updateRenderJobs: (newJobs) => {
				setServerJobs(newJobs);
			},
			updateClientRenders: (renders: CompletedClientRender[]) => {
				setClientJobs((prev) => {
					const existingIds = new Set(prev.map((j) => j.id));
					const updatedPrev = prev.map((job) => {
						const updated = renders.find((r) => r.id === job.id);
						if (updated && job.status === 'done') {
							return {
								...job,
								deletedOutputLocation: updated.deletedOutputLocation,
								metadata: updated.metadata,
							} as ClientRenderJob;
						}

						return job;
					});

					const newJobs = renders
						.filter((r) => !existingIds.has(r.id))
						.map((r): RestoredClientRenderJob => ({...r, status: 'done'}));

					return [...updatedPrev, ...newJobs];
				});
			},
		}),
		[],
	);

	const value: RenderQueueContextType = useMemo(() => {
		return {
			jobs: [...serverJobs, ...clientJobs],
			serverJobs,
			clientJobs,
			addClientStillJob,
			addClientVideoJob,
			updateClientJobProgress,
			markClientJobSaving,
			markClientJobDone,
			markClientJobFailed,
			markClientJobCancelled,
			removeClientJob,
			cancelClientJob,
			setProcessJobCallback,
			getAbortController,
			getCompositionForJob,
		};
	}, [
		serverJobs,
		clientJobs,
		addClientStillJob,
		addClientVideoJob,
		updateClientJobProgress,
		markClientJobSaving,
		markClientJobDone,
		markClientJobFailed,
		markClientJobCancelled,
		removeClientJob,
		cancelClientJob,
		setProcessJobCallback,
	]);

	return (
		<RenderQueueContext.Provider value={value}>
			{children}
		</RenderQueueContext.Provider>
	);
};
