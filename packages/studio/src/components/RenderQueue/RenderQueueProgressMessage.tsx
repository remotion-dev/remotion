import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {useZIndex} from '../../state/z-index';
import type {AnyRenderJob} from './context';
import {isClientRenderJob} from './context';
import {renderQueueItemSubtitleStyle} from './item-style';

const outputLocation: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
};

export const RenderQueueProgressMessage: React.FC<{
	readonly job: AnyRenderJob;
}> = ({job}) => {
	if (job.status !== 'running') {
		throw new Error('should not have rendered this component');
	}

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
	}, [job, isClientJob, setSelectedModal]);

	if (isClientJob) {
		const {renderedFrames, totalFrames} = job.progress;
		const message = `Rendering frame ${renderedFrames}/${totalFrames}`;
		return (
			<span style={outputLocation} title={message}>
				{message}
			</span>
		);
	}

	return (
		<button
			onClick={onClick}
			type="button"
			style={outputLocation}
			tabIndex={tabIndex}
			title={job.progress.message}
		>
			{job.progress.message}
		</button>
	);
};
