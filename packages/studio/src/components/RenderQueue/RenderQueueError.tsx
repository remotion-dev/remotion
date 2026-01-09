import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {useZIndex} from '../../state/z-index';
import type {AnyRenderJob} from './context';
import {isClientRenderJob} from './context';
import {renderQueueItemSubtitleStyle} from './item-style';

const outputLocation: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
};

export const RenderQueueError: React.FC<{
	readonly job: AnyRenderJob;
}> = ({job}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {tabIndex} = useZIndex();

	const isClientJob = isClientRenderJob(job);

	const onClick = useCallback(() => {
		if (isClientJob) {
			return;
		}

		setSelectedModal({
			type: 'render-progress',
			jobId: job.id,
		});
	}, [job.id, isClientJob, setSelectedModal]);

	if (job.status !== 'failed') {
		throw new Error('should not have rendered this component');
	}

	if (isClientJob) {
		return (
			<span style={outputLocation} title={job.error.message}>
				{job.error.message}
			</span>
		);
	}

	return (
		<button
			onClick={onClick}
			type="button"
			style={outputLocation}
			tabIndex={tabIndex}
			title={job.error.message}
		>
			{job.error.message}
		</button>
	);
};
