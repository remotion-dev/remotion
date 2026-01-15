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
		setSelectedModal({
			type: 'render-progress',
			jobId: job.id,
		});
	}, [job.id, setSelectedModal]);

	const message = isClientJob
		? `Rendering frame ${job.progress.renderedFrames}/${job.progress.totalFrames}`
		: job.progress.message;

	return (
		<button
			onClick={onClick}
			type="button"
			style={outputLocation}
			tabIndex={tabIndex}
			title={message}
		>
			{message}
		</button>
	);
};
