import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {
	CURRENT_COLOR,
	FAIL_COLOR,
	getBackgroundFromHoverState,
	LIGHT_TEXT,
} from '../../helpers/colors';
import {pushUrl} from '../../helpers/url-state';
import {ActionTooltip} from '../ActionTooltip';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {Row, Spacing} from '../layout';
import {useSelectAsset} from '../use-select-asset';
import type {CaptionJob} from './caption-job-types';
import {
	CircularProgress,
	RENDER_STATUS_INDICATOR_SIZE,
} from './CircularProgress';
import {RenderQueueContext} from './context';
import {
	renderQueueItemSubtitleStyle,
	RENDER_QUEUE_ITEM_SELECTED_CLASSNAME,
} from './item-style';
import {SuccessIcon} from './SuccessIcon';

const container: React.CSSProperties = {
	padding: 12,
	display: 'flex',
	flexDirection: 'row',
	paddingBottom: 10,
	paddingRight: 4,
	marginBottom: 1,
	marginLeft: 4,
	borderRadius: 4,
	width: 'calc(100% - 4px)',
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

const subtitleContainer: React.CSSProperties = {
	maxWidth: '100%',
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
};

const subtitle: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
	cursor: 'default',
};

const statusIcon: React.CSSProperties = {
	height: RENDER_STATUS_INDICATOR_SIZE,
	width: RENDER_STATUS_INDICATOR_SIZE,
};

const removeIcon: React.CSSProperties = {
	height: 16,
	color: CURRENT_COLOR,
};

const CaptionJobStatus: React.FC<{readonly job: CaptionJob}> = ({job}) => {
	if (job.status === 'running') {
		return (
			<div
				style={statusIcon}
				role="progressbar"
				aria-label="Caption job progress"
				aria-valuetext={job.progress.message}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(job.progress.value * 100)}
			>
				<CircularProgress progress={Math.max(0.07, job.progress.value)} />
			</div>
		);
	}

	if (job.status === 'done') {
		return <SuccessIcon />;
	}

	if (job.status === 'failed') {
		return (
			<svg style={statusIcon} viewBox="0 0 512 512">
				<path
					fill={FAIL_COLOR}
					d="M0 160V352L160 512H352L512 352V160L352 0H160L0 160zm353.9 32l-17 17-47 47 47 47 17 17L320 353.9l-17-17-47-47-47 47-17 17L158.1 320l17-17 47-47-47-47-17-17L192 158.1l17 17 47 47 47-47 17-17L353.9 192z"
				/>
			</svg>
		);
	}

	return (
		<svg style={statusIcon} viewBox="0 0 512 512">
			<path
				fill={LIGHT_TEXT}
				d="M256 512C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256s-114.6 256-256 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
			/>
		</svg>
	);
};

export const CaptionQueueItem: React.FC<{
	readonly job: CaptionJob;
	readonly selected: boolean;
}> = ({job, selected}) => {
	const [hovered, setHovered] = useState(false);
	const {removeCaptionJob} = useContext(RenderQueueContext);
	const selectAsset = useSelectAsset();
	const isHoverable = job.status === 'done';

	const containerStyle: React.CSSProperties = useMemo(() => {
		return {
			...container,
			backgroundColor: getBackgroundFromHoverState({
				hovered: isHoverable && hovered,
				selected,
			}),
			userSelect: 'none',
			WebkitUserSelect: 'none',
		};
	}, [hovered, isHoverable, selected]);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const scrollCurrentIntoView = useCallback(() => {
		document
			.querySelector(`.${RENDER_QUEUE_ITEM_SELECTED_CLASSNAME}`)
			?.scrollIntoView({behavior: 'smooth'});
	}, []);

	const onClick = useCallback(() => {
		if (job.status !== 'done') {
			return;
		}

		selectAsset(job.outName);
		pushUrl(`/assets/${job.outName}`);
	}, [job, selectAsset]);

	useEffect(() => {
		if (selected) {
			scrollCurrentIntoView();
		}
	}, [scrollCurrentIntoView, selected]);

	const onRemove: React.MouseEventHandler = useCallback(
		(event) => {
			event.stopPropagation();
			removeCaptionJob(job.id);
		},
		[job.id, removeCaptionJob],
	);

	const renderRemoveAction: RenderInlineAction = useCallback((color) => {
		return (
			<svg style={removeIcon} viewBox="0 0 320 512">
				<path
					fill={color}
					d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
				/>
			</svg>
		);
	}, []);

	const message = useMemo(() => {
		if (job.status === 'idle') {
			return 'Queued for transcription';
		}

		if (job.status === 'running') {
			return job.progress.message;
		}

		if (job.status === 'failed') {
			return job.error.message;
		}

		return job.outName;
	}, [job]);

	return (
		<Row
			data-render-queue-item={job.id}
			style={containerStyle}
			align="center"
			onClick={onClick}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			className={selected ? RENDER_QUEUE_ITEM_SELECTED_CLASSNAME : undefined}
		>
			<CaptionJobStatus job={job} />
			<Spacing x={1} />
			<div style={right}>
				<div style={title}>{job.displayName}</div>
				<div style={subtitleContainer}>
					<span style={subtitle} title={message}>
						{message}
					</span>
				</div>
			</div>
			<Spacing x={1} />
			{job.status === 'running' ? null : (
				<ActionTooltip label="Clear" shortcut={null} delay={800} dismissOnClick>
					{(describedBy) => (
						<InlineAction
							renderAction={renderRemoveAction}
							onClick={onRemove}
							aria-label="Clear"
							aria-describedby={describedBy}
							variant={null}
						/>
					)}
				</ActionTooltip>
			)}
		</Row>
	);
};
