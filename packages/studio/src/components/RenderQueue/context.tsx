import type {
	ClientRenderJob,
	ClientRenderJobProgress,
	ClientRenderMetadata,
	ClientStillRenderJob,
	ClientVideoRenderJob,
	GetBlobCallback,
	RenderJob,
} from '@remotion/studio-shared';
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

declare global {
	interface Window {
		remotion_initialRenderQueue: RenderJob[] | null;
	}
}

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
	markClientJobDone: (
		jobId: string,
		getBlob: GetBlobCallback,
		metadata: ClientRenderMetadata,
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
}>();

export const RenderQueueContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [serverJobs, setServerJobs] = useState<RenderJob[]>(
		window.remotion_initialRenderQueue ?? [],
	);
	const [clientJobs, setClientJobs] = useState<ClientRenderJob[]>([]);
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

	const markClientJobDone = useCallback(
		(
			jobId: string,
			getBlob: GetBlobCallback,
			metadata: ClientRenderMetadata,
		): void => {
			deleteAbortController(jobId);
			cleanupCompositionForJob(jobId);

			setClientJobs((prev) =>
				prev.map((job) =>
					job.id === jobId
						? ({...job, status: 'done', getBlob, metadata} as ClientRenderJob)
						: job,
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
					? {
							...job,
							status: 'cancelled',
						}
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
		}),
		[],
	);

	const value: RenderQueueContextType = useMemo(() => {
		const combined: AnyRenderJob[] = [...serverJobs, ...clientJobs].sort(
			(a, b) => b.startedAt - a.startedAt,
		);

		return {
			jobs: combined,
			serverJobs,
			clientJobs,
			addClientStillJob,
			addClientVideoJob,
			updateClientJobProgress,
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
