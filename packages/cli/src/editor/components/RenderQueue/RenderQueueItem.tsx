import React from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {Row, Spacing} from '../layout';
import {RenderQueueItemStatus} from './RenderQueueItemStatus';
import {RenderQueueOutputName} from './RenderQueueOutputName';

const container: React.CSSProperties = {
	padding: 12,
	display: 'flex',
	flexDirection: 'row',
};

const title: React.CSSProperties = {
	fontSize: 14,
	lineHeight: 1,
};

const right: React.CSSProperties = {
	flex: 1,
};

export const RenderQueueItem: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	return (
		<Row style={container} align="center">
			<RenderQueueItemStatus job={job} />
			<Spacing x={1} />
			<div style={right}>
				<div style={title}>{job.compositionId}</div>
				<RenderQueueOutputName job={job} />
			</div>
		</Row>
	);
};
