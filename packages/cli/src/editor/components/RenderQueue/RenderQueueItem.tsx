import React from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {RenderQueueOutputName} from './RenderQueueOutputName';

const container: React.CSSProperties = {
	padding: 12,
};

const title: React.CSSProperties = {
	fontSize: 14,
};

export const RenderQueueItem: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	return (
		<div style={container}>
			<div style={title}>{job.compositionId}</div>
			<RenderQueueOutputName job={job} />
		</div>
	);
};
