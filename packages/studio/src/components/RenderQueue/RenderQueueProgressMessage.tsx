import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {useZIndex} from '../../state/z-index';
import {renderQueueItemSubtitleStyle} from './item-style';

const outputLocation: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
};

export const RenderQueueProgressMessage: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	if (job.status !== 'running') {
		throw new Error('should not have rendered this component');
	}

	const {setSelectedModal} = useContext(ModalsContext);
	const {tabIndex} = useZIndex();

	const onClick = useCallback(() => {
		setSelectedModal({
			type: 'render-progress',
			jobId: job.id,
		});
	}, [job, setSelectedModal]);

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
