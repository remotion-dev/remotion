import type {ClientRenderJob} from '@remotion/studio-shared';
import {formatBytes} from '@remotion/studio-shared';
import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
import {CircularProgress} from '../RenderQueue/CircularProgress';
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
}> = ({renderedFrames, totalFrames}) => {
	const done = renderedFrames === totalFrames;
	const progress = totalFrames > 0 ? renderedFrames / totalFrames : 0;

	return (
		<div style={progressItem}>
			{done ? <SuccessIcon /> : <CircularProgress progress={progress} />}
			<Spacing x={1} />
			<div style={label}>
				{done
					? `Rendered ${totalFrames} frames`
					: `Rendering ${renderedFrames} / ${totalFrames} frames`}
			</div>
		</div>
	);
};

const EncodingProgress: React.FC<{
	readonly encodedFrames: number;
	readonly totalFrames: number;
}> = ({encodedFrames, totalFrames}) => {
	const done = encodedFrames === totalFrames;
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
	if (job.status === 'idle' || job.status === 'failed') {
		throw new Error(
			'This component should not be rendered when the job is idle or failed',
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

	const {renderedFrames, encodedFrames, totalFrames} = job.progress;

	return (
		<div>
			<Spacing y={0.5} />
			<RenderingProgress
				renderedFrames={renderedFrames}
				totalFrames={totalFrames}
			/>
			{job.type === 'client-video' && (
				<EncodingProgress
					encodedFrames={encodedFrames}
					totalFrames={totalFrames}
				/>
			)}
			<Spacing y={1} />
		</div>
	);
};
