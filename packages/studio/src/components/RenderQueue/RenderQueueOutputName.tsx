import type {RenderJob} from '@remotion/studio-shared';
import React, {useMemo} from 'react';
import type {AnyRenderJob} from './context';
import {isClientRenderJob} from './context';
import {renderQueueItemSubtitleStyle} from './item-style';

export const RenderQueueOutputName: React.FC<{
	readonly job: AnyRenderJob;
}> = ({job}) => {
	const isClientJob = isClientRenderJob(job);

	const deletedOutputLocation = isClientJob
		? false
		: (job as RenderJob).deletedOutputLocation;

	const style = useMemo((): React.CSSProperties => {
		return {
			...renderQueueItemSubtitleStyle,
			textDecoration: deletedOutputLocation ? 'line-through' : 'none',
			color: renderQueueItemSubtitleStyle.color,
			cursor: 'inherit',
		};
	}, [deletedOutputLocation]);

	const title = isClientJob
		? `Downloaded as ${job.outName}`
		: deletedOutputLocation
			? 'File was deleted'
			: job.outName;

	return (
		<span style={style} title={title}>
			{job.outName}
		</span>
	);
};
