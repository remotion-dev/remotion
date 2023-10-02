import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {getBackgroundFromHoverState} from '../../helpers/colors';
import {Row, Spacing} from '../layout';
import {
	RenderQueueCopyToClipboard,
	supportsCopyingToClipboard,
} from './RenderQueueCopyToClipboard';
import {RenderQueueError} from './RenderQueueError';
import {RenderQueueCancelButton} from './RenderQueueItemCancelButton';
import {RenderQueueItemStatus} from './RenderQueueItemStatus';
import {RenderQueueOpenInFinderItem} from './RenderQueueOpenInFolder';
import {RenderQueueOutputName} from './RenderQueueOutputName';
import {RenderQueueProgressMessage} from './RenderQueueProgressMessage';
import {RenderQueueRemoveItem} from './RenderQueueRemoveItem';
import {RenderQueueRepeatItem} from './RenderQueueRepeat';

const container: React.CSSProperties = {
	padding: 12,
	display: 'flex',
	flexDirection: 'row',
	paddingBottom: 10,
	paddingRight: 4,
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
	selected: boolean;
}> = ({job, selected}) => {
	const [hovered, setHovered] = useState(false);

	const {setCanvasContent} = useContext(Internals.CompositionManager);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const isHoverable = job.status === 'done';

	const containerStyle: React.CSSProperties = useMemo(() => {
		return {
			...container,
			backgroundColor: getBackgroundFromHoverState({
				hovered: isHoverable && hovered,
				selected,
			}),
			userSelect: 'none',
		};
	}, [hovered, isHoverable, selected]);

	const onClick: React.MouseEventHandler = useCallback(() => {
		if (job.status !== 'done') {
			return;
		}

		setCanvasContent({type: 'output', path: `/${job.outName}`});
		window.history.pushState({}, 'Studio', `/outputs/${job.outName}`);
	}, [job.outName, job.status, setCanvasContent]);

	return (
		<Row
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={containerStyle}
			align="center"
			onClick={onClick}
		>
			<RenderQueueItemStatus job={job} />
			<Spacing x={1} />
			<div style={right}>
				<div style={title}>{job.compositionId}</div>
				<div style={subtitle}>
					{job.status === 'done' ? (
						<RenderQueueOutputName job={job} />
					) : job.status === 'failed' ? (
						<RenderQueueError job={job} />
					) : job.status === 'running' ? (
						<RenderQueueProgressMessage job={job} />
					) : null}
				</div>
			</div>
			<Spacing x={1} />
			{supportsCopyingToClipboard(job) ? (
				<RenderQueueCopyToClipboard job={job} />
			) : null}
			{job.status === 'done' || job.status === 'failed' ? (
				<RenderQueueRepeatItem job={job} />
			) : null}
			{job.status === 'running' ? (
				<RenderQueueCancelButton job={job} />
			) : (
				<RenderQueueRemoveItem job={job} />
			)}
			{job.status === 'done' ? <RenderQueueOpenInFinderItem job={job} /> : null}
		</Row>
	);
};
