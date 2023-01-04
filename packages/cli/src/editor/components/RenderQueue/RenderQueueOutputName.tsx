import React, {useCallback, useMemo} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {sendErrorNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from './actions';
import {renderQueueItemSubtitleStyle} from './item-style';

export const RenderQueueOutputName: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	const onClick = useCallback(() => {
		openInFileExplorer({directory: job.outName}).catch((err) => {
			sendErrorNotification(`Could not open file: ${err.message}`);
		});
	}, [job.outName]);

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
