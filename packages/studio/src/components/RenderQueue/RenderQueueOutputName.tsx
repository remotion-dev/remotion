import React, {useMemo} from 'react';
import type {AnyRenderJob} from './context';
import {renderQueueItemSubtitleStyle} from './item-style';

export const RenderQueueOutputName: React.FC<{
	readonly job: AnyRenderJob;
}> = ({job}) => {
	const deletedOutputLocation =
		'deletedOutputLocation' in job && job.deletedOutputLocation;

	const style = useMemo((): React.CSSProperties => {
		return {
			...renderQueueItemSubtitleStyle,
			textDecoration: deletedOutputLocation ? 'line-through' : 'none',
			color: renderQueueItemSubtitleStyle.color,
			cursor: 'inherit',
		};
	}, [deletedOutputLocation]);

	const getTitle = (): string => {
		if (deletedOutputLocation) {
			return 'File was deleted';
		}

		return job.outName;
	};

	return (
		<span style={style} title={getTitle()}>
			{job.outName}
		</span>
	);
};
