import React, {useCallback, useContext} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {ModalsContext} from '../../state/modals';
import {renderQueueItemSubtitleStyle} from './item-style';

const outputLocation: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
};

export const RenderQueueError: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onClick = useCallback(() => {
		setSelectedModal({
			type: 'render-error',
			job,
		});
	}, [job, setSelectedModal]);

	if (job.status !== 'failed') {
		throw new Error('should not have rendered this component');
	}

	return (
		<button
			onClick={onClick}
			type="button"
			style={outputLocation}
			title={job.error.message}
		>
			{job.error.message}
		</button>
	);
};
