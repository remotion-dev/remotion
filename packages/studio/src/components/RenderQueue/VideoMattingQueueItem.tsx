import React, {useCallback, useContext, useMemo, useState} from 'react';
import {
	CURRENT_COLOR,
	FAIL_COLOR,
	getBackgroundFromHoverState,
	LIGHT_TEXT,
} from '../../helpers/colors';
import {pushUrl} from '../../helpers/url-state';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {Row, Spacing} from '../layout';
import {useSelectAsset} from '../use-select-asset';
import {
	CircularProgress,
	RENDER_STATUS_INDICATOR_SIZE,
} from './CircularProgress';
import {RenderQueueContext} from './context';
import {renderQueueItemSubtitleStyle} from './item-style';
import {SuccessIcon} from './SuccessIcon';
import type {VideoMattingJob} from './video-matting-job-types';

const container: React.CSSProperties = {
	borderRadius: 4,
	display: 'flex',
	marginBottom: 1,
	marginLeft: 4,
	padding: 12,
	paddingBottom: 10,
	paddingRight: 4,
	width: 'calc(100% - 4px)',
};
const title: React.CSSProperties = {fontSize: 13, lineHeight: 1};
const right: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	overflow: 'hidden',
};
const subtitle: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
	cursor: 'default',
};
const subtitles: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
};
const statusIcon: React.CSSProperties = {
	height: RENDER_STATUS_INDICATOR_SIZE,
	width: RENDER_STATUS_INDICATOR_SIZE,
};
const removeIcon: React.CSSProperties = {color: CURRENT_COLOR, height: 16};

const Status: React.FC<{readonly job: VideoMattingJob}> = ({job}) => {
	if (job.status === 'running') {
		return (
			<div
				style={statusIcon}
				role="progressbar"
				aria-label="Video matting progress"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(job.progress.value * 100)}
				aria-valuetext={job.progress.message}
			>
				<CircularProgress progress={Math.max(0.07, job.progress.value)} />
			</div>
		);
	}

	if (job.status === 'done') return <SuccessIcon />;
	if (job.status === 'failed')
		return (
			<svg style={statusIcon} viewBox="0 0 512 512">
				<path
					fill={FAIL_COLOR}
					d="M0 160V352L160 512H352L512 352V160L352 0H160L0 160zm353.9 32-64 64 64 64L320 353.9l-64-64-64 64L158.1 320l64-64-64-64L192 158.1l64 64 64-64z"
				/>
			</svg>
		);
	return (
		<svg style={statusIcon} viewBox="0 0 512 512">
			<path
				fill={LIGHT_TEXT}
				d="M256 512C114.6 512 0 397.4 0 256S114.6 0 256 0s256 114.6 256 256-114.6 256-256 256zM232 120v136c0 8 4 15.5 10.7 20l96 64 26.6-39.9-85.3-56.9V120z"
			/>
		</svg>
	);
};

export const VideoMattingQueueItem: React.FC<{
	readonly job: VideoMattingJob;
	readonly selected: boolean;
}> = ({job, selected}) => {
	const [hovered, setHovered] = useState(false);
	const {removeVideoMattingJob} = useContext(RenderQueueContext);
	const selectAsset = useSelectAsset();
	const done = job.status === 'done';
	const style = useMemo(
		() => ({
			...container,
			backgroundColor: getBackgroundFromHoverState({
				hovered: done && hovered,
				selected,
			}),
			userSelect: 'none' as const,
		}),
		[done, hovered, selected],
	);
	const messages =
		job.status === 'idle'
			? ['Queued for video matting']
			: job.status === 'running'
				? [job.progress.message, job.progress.detail].filter(
						(message): message is string => message !== null,
					)
				: job.status === 'failed'
					? [job.error.message]
					: [job.baseOutName, job.foregroundOutName];
	const tooltip = messages.join('\n');
	const onClick = useCallback(() => {
		if (!done) return;
		selectAsset(job.foregroundOutName);
		pushUrl(`/assets/${job.foregroundOutName}`);
	}, [done, job.foregroundOutName, selectAsset]);
	const onRemove: React.MouseEventHandler = useCallback(
		(event) => {
			event.stopPropagation();
			removeVideoMattingJob(job.id);
		},
		[job.id, removeVideoMattingJob],
	);
	const renderRemove: RenderInlineAction = useCallback(
		(color) => (
			<svg style={removeIcon} viewBox="0 0 320 512">
				<path
					fill={color}
					d="M310.6 150.6 205.3 256l105.3 105.4-45.3 45.3L160 301.3 54.6 406.6 9.4 361.4 114.7 256 9.4 150.6l45.2-45.2L160 210.7l105.3-105.3z"
				/>
			</svg>
		),
		[],
	);
	return (
		<Row
			data-render-queue-item={job.id}
			style={style}
			align="center"
			onClick={onClick}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<Status job={job} />
			<Spacing x={1} />
			<div style={right}>
				<div style={title}>{job.displayName}</div>
				<div style={subtitles} title={tooltip}>
					{messages.map((message) => (
						<span key={message} style={subtitle}>
							{message}
						</span>
					))}
				</div>
			</div>
			<Spacing x={1} />
			{job.status === 'running' ? null : (
				<InlineAction
					renderAction={renderRemove}
					onClick={onRemove}
					title="Remove"
					variant={null}
				/>
			)}
		</Row>
	);
};
