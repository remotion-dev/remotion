import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {useZIndex} from '../../state/z-index';
import {renderQueueItemSubtitleStyle} from './item-style';

const outputLocation: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
};

export const RenderQueueError: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {tabIndex} = useZIndex();

	const onClick = useCallback(() => {
		setSelectedModal({
			type: 'render-progress',
			jobId: job.id,
		});
	}, [job.id, setSelectedModal]);

	if (job.status !== 'failed') {
		throw new Error('should not have rendered this component');
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
