import React from 'react';
import type {BaseRenderProgress} from '../../../preview-server/render-queue/job';
import type {
	AggregateRenderProgress,
	RenderingProgressInput,
} from '../../../progress-types';
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
};

const BundlingProgress: React.FC<{
	progress: number;
	doneIn: number | null;
}> = ({progress, doneIn}) => {
	return (
		<div style={progressItem}>
			{progress === 1 ? (
				<SuccessIcon />
			) : (
				<CircularProgress progress={progress} />
			)}
			<Spacing x={1} />
			<div style={label}>
				{progress === 1 ? 'Bundled' : `Bundling ${progress * 100}%`}
			</div>
			{doneIn ? <div style={label}>{doneIn}ms</div> : null}
		</div>
	);
};

const RenderingProgress: React.FC<{
	progress: RenderingProgressInput;
}> = ({progress}) => {
	return (
		<div style={progressItem}>
			{progress.frames === progress.totalFrames ? (
				<SuccessIcon />
			) : (
				<CircularProgress progress={progress.frames / progress.totalFrames} />
			)}
			<Spacing x={1} />
			<div style={label}>
				{progress.doneIn === 1
					? `Rendered ${progress.totalFrames} frames`
					: `Rendering ${progress.frames} / ${progress.totalFrames} frames`}
			</div>
			{progress.doneIn ? <div style={label}>{progress.doneIn}ms</div> : null}
		</div>
	);
};

export const GuiRenderStatus: React.FC<{
	progress: BaseRenderProgress & AggregateRenderProgress;
}> = ({progress}) => {
	return (
		<div>
			<BundlingProgress
				progress={progress.bundling.progress}
				doneIn={progress.bundling.doneIn}
			/>
			{progress.rendering ? (
				<RenderingProgress progress={progress.rendering} />
			) : null}
			<Spacing y={2} />
		</div>
	);
};
