import React, {useCallback, useContext, useMemo} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {ModalsContext} from '../../state/modals';
import {renderQueueItemSubtitleStyle} from './item-style';

export const RenderQueueOutputName: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onClick = useCallback(() => {
		setSelectedModal({
			type: 'render-progress',
			jobId: job.id,
		});
	}, [job, setSelectedModal]);

	const style = useMemo((): React.CSSProperties => {
		return {
			...renderQueueItemSubtitleStyle,
			cursor: job.deletedOutputLocation ? 'inherit' : 'pointer',
			textDecoration: job.deletedOutputLocation ? 'line-through' : 'none',
		};
	}, [job.deletedOutputLocation]);

	return (
		<button
			onClick={onClick}
			type="button"
			style={style}
			disabled={job.deletedOutputLocation}
			title={job.deletedOutputLocation ? 'File was deleted' : job.outName}
		>
			{job.outName}
		</button>
	);
};
