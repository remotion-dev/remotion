import React from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';

export const RenderQueueItem: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	return <div>{job.compositionId}</div>;
};
