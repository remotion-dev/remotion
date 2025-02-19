import type {
	DownloadProgress,
	RenderingProgressInput,
	RenderJob,
	StitchingProgressInput,
} from '@remotion/studio-shared';
import React, {useCallback, useMemo} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
import {openInFileExplorer} from '../RenderQueue/actions';
import {CircularProgress} from '../RenderQueue/CircularProgress';
import {RenderQueueOpenInFinderItem} from '../RenderQueue/RenderQueueOpenInFolder';
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

const BundlingProgress: React.FC<{
	readonly progress: number;
	readonly doneIn: number | null;
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
	readonly progress: RenderingProgressInput;
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
	readonly progress: StitchingProgressInput;
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

const DownloadsProgress: React.FC<{
	readonly downloads: DownloadProgress[];
}> = ({downloads}) => {
	const allHaveProgress = downloads.every((a) => a.totalBytes);
	const totalBytes = allHaveProgress
		? downloads.reduce((a, b) => a + (b.totalBytes as number), 0)
		: null;
	const downloaded = allHaveProgress
		? downloads.reduce((a, b) => a + (b.downloaded as number), 0)
		: null;

	const progress = allHaveProgress
		? (downloaded as number) / (totalBytes as number)
		: 0.1;

	return (
		<div style={progressItem}>
			{progress === 1 ? (
				<SuccessIcon />
			) : (
				<CircularProgress progress={progress} />
			)}
			<Spacing x={1} />
			<div style={label}>
				Downloading {downloads.length} file{downloads.length === 1 ? '' : 's'}
			</div>
		</div>
	);
};

const OpenFile: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	const labelStyle = useMemo(() => {
		return {
			...label,
			textAlign: 'left' as const,
			appearance: 'none' as const,
			border: 0,
			paddingLeft: 0,
			cursor: job.deletedOutputLocation ? 'inherit' : 'pointer',
			textDecoration: job.deletedOutputLocation ? 'line-through' : 'none',
		};
	}, [job.deletedOutputLocation]);

	const onClick = useCallback(() => {
		openInFileExplorer({directory: job.outName});
	}, [job.outName]);

	return (
		<div style={progressItem}>
			<SuccessIcon />
			<Spacing x={1} />
			<button style={labelStyle} type="button" onClick={onClick}>
				{job.outName}
			</button>
			<div style={right}>
				<RenderQueueOpenInFinderItem job={job} />
			</div>
		</div>
	);
};

export const GuiRenderStatus: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	if (job.status === 'idle' || job.status === 'failed') {
		throw new Error(
			'This component should not be rendered when the job is idle',
		);
	}

	return (
		<div>
			<Spacing y={0.5} />
			<BundlingProgress
				progress={job.progress.bundling.progress}
				doneIn={job.progress.bundling.doneIn}
			/>
			{job.progress.rendering ? (
				<RenderingProgress progress={job.progress.rendering} />
			) : null}
			{job.progress.stitching ? (
				<StitchingProgress progress={job.progress.stitching} />
			) : null}
			{job.progress.downloads.length > 0 ? (
				<DownloadsProgress downloads={job.progress.downloads} />
			) : null}
			{job.status === 'done' ? <OpenFile job={job} /> : null}
			<Spacing y={1} />
		</div>
	);
};
