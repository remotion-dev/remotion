import type {RenderJob} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals} from 'remotion';
import {getBackgroundFromHoverState} from '../../helpers/colors';
import {pushUrl} from '../../helpers/url-state';
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

const SELECTED_CLASSNAME = '__remotion_selected_classname';

export const RenderQueueItem: React.FC<{
	readonly job: RenderJob;
	readonly selected: boolean;
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
				hovered: isHoverable && hovered && job.type !== 'sequence',
				selected,
			}),
			userSelect: 'none',
			WebkitUserSelect: 'none',
		};
	}, [hovered, isHoverable, job.type, selected]);

	const scrollCurrentIntoView = useCallback(() => {
		document
			.querySelector(`.${SELECTED_CLASSNAME}`)
			?.scrollIntoView({behavior: 'smooth'});
	}, []);

	const onClick: React.MouseEventHandler = useCallback(() => {
		if (job.status !== 'done') {
			return;
		}

		// Cannot show folders
		if (job.type === 'sequence') {
			return;
		}

		setCanvasContent((c: CanvasContent | null): CanvasContent => {
			const isAlreadySelected =
				c && c.type === 'output' && c.path === `/${job.outName}`;

			if (isAlreadySelected && !selected) {
				scrollCurrentIntoView();
				return c;
			}

			return {type: 'output', path: `/${job.outName}`};
		});
		pushUrl(`/outputs/${job.outName}`);
	}, [job, scrollCurrentIntoView, selected, setCanvasContent]);

	useEffect(() => {
		if (selected) {
			scrollCurrentIntoView();
		}
	}, [scrollCurrentIntoView, selected]);

	return (
		<Row
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={containerStyle}
			align="center"
			onClick={onClick}
			className={selected ? SELECTED_CLASSNAME : undefined}
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
