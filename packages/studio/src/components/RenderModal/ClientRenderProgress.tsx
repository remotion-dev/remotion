import {formatBytes} from '@remotion/studio-shared';
import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
import {CircularProgress} from '../RenderQueue/CircularProgress';
import {getClientRenderProgressMessage} from '../RenderQueue/client-render-progress';
import type {ClientRenderJob} from '../RenderQueue/client-side-render-types';
import {SuccessIcon} from '../RenderQueue/SuccessIcon';

const progressItem: React.CSSProperties = {
	padding: 10,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const label: React.CSSProperties = {
	fontSize: 14,
	width: 400,
	color: 'white',
};

const right: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	textAlign: 'right',
	flex: 1,
};

const ProgressStatus: React.FC<{
	readonly encodedFrames: number;
	readonly totalFrames: number;
	readonly doneIn: number | null;
	readonly renderEstimatedTime: number;
	readonly progress: number;
}> = ({encodedFrames, totalFrames, doneIn, renderEstimatedTime, progress}) => {
	const done = doneIn !== null;
	const message = getClientRenderProgressMessage({
		encodedFrames,
		totalFrames,
		doneIn,
		renderEstimatedTime,
		progress,
	});

	return (
		<div style={progressItem}>
			{done ? <SuccessIcon /> : <CircularProgress progress={progress} />}
			<Spacing x={1} />
			<div style={label}>{message}</div>
			{doneIn !== null ? <div style={right}>{doneIn}ms</div> : null}
		</div>
	);
};

const DoneStatus: React.FC<{
	readonly job: ClientRenderJob & {status: 'done'};
}> = ({job}) => {
	return (
		<div style={progressItem}>
			<SuccessIcon />
			<Spacing x={1} />
			<div style={label}>{job.outName}</div>
			<div style={right}>{formatBytes(job.metadata.sizeInBytes)}</div>
		</div>
	);
};

export const ClientRenderProgress: React.FC<{
	readonly job: ClientRenderJob;
}> = ({job}) => {
	if (
		job.status === 'idle' ||
		job.status === 'failed' ||
		job.status === 'cancelled'
	) {
		throw new Error(
			'This component should not be rendered when the job is idle, failed, or cancelled',
		);
	}

	if (job.status === 'done') {
		return (
			<div>
				<Spacing y={0.5} />
				<DoneStatus job={job} />
				<Spacing y={1} />
			</div>
		);
	}

	if (job.status === 'saving') {
		return (
			<div>
				<Spacing y={0.5} />
				<div style={label}>Saving to out/...</div>
				<Spacing y={1} />
			</div>
		);
	}

	const {encodedFrames, totalFrames, doneIn, renderEstimatedTime, progress} =
		job.progress;

	return (
		<div>
			<Spacing y={0.5} />
			{job.type === 'client-video' && (
				<ProgressStatus
					encodedFrames={encodedFrames}
					totalFrames={totalFrames}
					doneIn={doneIn}
					renderEstimatedTime={renderEstimatedTime}
					progress={progress}
				/>
			)}
			<Spacing y={1} />
		</div>
	);
};
