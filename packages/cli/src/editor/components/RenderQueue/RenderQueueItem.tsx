import React from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {Row, Spacing} from '../layout';
import {RenderQueueError} from './RenderQueueError';
import {RenderQueueItemStatus} from './RenderQueueItemStatus';
import {RenderQueueOutputName} from './RenderQueueOutputName';
import {RenderQueueRemoveItem} from './RenderQueueRemoveItem';

const container: React.CSSProperties = {
	padding: 12,
	display: 'flex',
	flexDirection: 'row',
	paddingBottom: 10,
};

const title: React.CSSProperties = {
	fontSize: 13,
	lineHeight: 1,
};

const right: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
};

const subtitle: React.CSSProperties = {
	maxWidth: '100%',
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
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
				<div style={subtitle}>
					{job.status === 'done' ? (
						<RenderQueueOutputName job={job} />
					) : job.status === 'failed' ? (
						<RenderQueueError job={job} />
					) : null}
				</div>
			</div>
			<Spacing x={1} />
			<RenderQueueRemoveItem job={job} />
		</Row>
	);
};
