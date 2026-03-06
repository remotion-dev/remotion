import {formatBytes} from '@remotion/studio-shared';
import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
import {CircularProgress} from '../RenderQueue/CircularProgress';
import {formatEtaString} from '../RenderQueue/client-render-progress';
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

const RenderingProgress: React.FC<{
	readonly renderedFrames: number;
	readonly totalFrames: number;
	readonly renderedDoneIn: number | null;
	readonly renderEstimatedTime: number;
}> = ({renderedFrames, totalFrames, renderedDoneIn, renderEstimatedTime}) => {
	const done = renderedDoneIn !== null;
	const progress = totalFrames > 0 ? renderedFrames / totalFrames : 0;
	const etaString =
		!done && renderEstimatedTime > 0
			? `, time remaining: ${formatEtaString(renderEstimatedTime)}`
			: '';

	return (
		<div style={progressItem}>
			{done ? <SuccessIcon /> : <CircularProgress progress={progress} />}
			<Spacing x={1} />
			<div style={label}>
				{done
					? `Rendered ${totalFrames} frames`
					: `Rendered ${renderedFrames} / ${totalFrames} frames${etaString}`}
			</div>
			{renderedDoneIn !== null ? (
				<div style={right}>{renderedDoneIn}ms</div>
			) : null}
		</div>
	);
};

const EncodingProgress: React.FC<{
	readonly encodedFrames: number;
	readonly totalFrames: number;
	readonly encodedDoneIn: number | null;
}> = ({encodedFrames, totalFrames, encodedDoneIn}) => {
	const done = encodedDoneIn !== null;
	const progress = totalFrames > 0 ? encodedFrames / totalFrames : 0;

	return (
		<div style={progressItem}>
			{done ? <SuccessIcon /> : <CircularProgress progress={progress} />}
			<Spacing x={1} />
			<div style={label}>
				{done
					? `Encoded ${totalFrames} frames`
					: `Encoding ${encodedFrames} / ${totalFrames} frames`}
			</div>
			{encodedDoneIn !== null ? (
				<div style={right}>{encodedDoneIn}ms</div>
			) : null}
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

	const {
		renderedFrames,
		encodedFrames,
		totalFrames,
		renderedDoneIn,
		encodedDoneIn,
		renderEstimatedTime,
	} = job.progress;

	return (
		<div>
			<Spacing y={0.5} />
			{job.type === 'client-video' && (
				<>
					<RenderingProgress
						renderedFrames={renderedFrames}
						totalFrames={totalFrames}
						renderedDoneIn={renderedDoneIn}
						renderEstimatedTime={renderEstimatedTime}
					/>
					<EncodingProgress
						encodedFrames={encodedFrames}
						totalFrames={totalFrames}
						encodedDoneIn={encodedDoneIn}
					/>
				</>
			)}
			<Spacing y={1} />
		</div>
	);
};
