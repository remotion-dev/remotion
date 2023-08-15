import React, {createRef, useImperativeHandle, useMemo, useState} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';

declare global {
	interface Window {
		remotion_initialRenderQueue: RenderJob[];
	}
}

type RenderQueueContextType = {
	jobs: RenderJob[];
};

export const RenderQueueContext = React.createContext<RenderQueueContextType>({
	jobs: [],
});

export const renderJobsRef = createRef<{
	updateRenderJobs: (jobs: RenderJob[]) => void;
}>();

export const RenderQueueContextProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [jobs, setJobs] = useState<RenderJob[]>(
		window.remotion_initialRenderQueue
	);

	const value: RenderQueueContextType = useMemo(() => {
		return {
			jobs,
		};
	}, [jobs]);

	useImperativeHandle(
		renderJobsRef,
		() => {
			return {
				updateRenderJobs: (newJobs) => {
					setJobs(newJobs);
				},
			};
		},
		[]
	);

	return (
		<RenderQueueContext.Provider value={value}>
			{children}
		</RenderQueueContext.Provider>
	);
};
