import React from 'react';
import type {BaseRenderProgress} from '../../../preview-server/render-queue/job';
import type {
	AggregateRenderProgress,
	RenderingProgressInput,
	StitchingProgressInput,
} from '../../../progress-types';
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
	width: 100,
	textAlign: 'right',
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
			{doneIn ? <div style={right}>{doneIn}ms</div> : null}
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
				{progress.doneIn
					? `Rendered ${progress.totalFrames} frames`
					: `Rendering ${progress.frames} / ${progress.totalFrames} frames`}
			</div>
			{progress.doneIn ? <div style={right}>{progress.doneIn}ms</div> : null}
		</div>
	);
};

const StitchingProgress: React.FC<{
	progress: StitchingProgressInput;
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
				{progress.doneIn
					? `Stitched ${progress.totalFrames} frames`
					: `Stitching ${progress.frames} / ${progress.totalFrames} frames`}
			</div>
			{progress.doneIn ? <div style={right}>{progress.doneIn}ms</div> : null}
		</div>
	);
};

export const GuiRenderStatus: React.FC<{
	progress: BaseRenderProgress & AggregateRenderProgress;
}> = ({progress}) => {
	return (
		<div>
			<Spacing y={0.5} />
			<BundlingProgress
				progress={progress.bundling.progress}
				doneIn={progress.bundling.doneIn}
			/>
			{progress.rendering ? (
				<RenderingProgress progress={progress.rendering} />
			) : null}
			{progress.stitching ? (
				<StitchingProgress progress={progress.stitching} />
			) : null}
			<Spacing y={2} />
		</div>
	);
};
