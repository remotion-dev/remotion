import type {ClientRenderJob, RenderJob} from '@remotion/studio-shared';
import React, {
	createRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import {getClientJobs, subscribeToClientQueue} from './client-render-queue';

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
};

export const RenderQueueContext = React.createContext<RenderQueueContextType>({
	jobs: [],
	serverJobs: [],
	clientJobs: [],
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
	const [clientJobs, setClientJobs] = useState<ClientRenderJob[]>(() =>
		getClientJobs(),
	);

	useEffect(() => {
		const unsubscribe = subscribeToClientQueue(() => {
			setClientJobs(getClientJobs());
		});
		return unsubscribe;
	}, []);

	const value: RenderQueueContextType = useMemo(() => {
		const combined: AnyRenderJob[] = [...serverJobs, ...clientJobs].sort(
			(a, b) => b.startedAt - a.startedAt,
		);

		return {
			jobs: combined,
			serverJobs,
			clientJobs,
		};
	}, [serverJobs, clientJobs]);

	useImperativeHandle(renderJobsRef, () => {
		return {
			updateRenderJobs: (newJobs) => {
				setServerJobs(newJobs);
			},
		};
	}, []);

	return (
		<RenderQueueContext.Provider value={value}>
			{children}
		</RenderQueueContext.Provider>
	);
};
