import React, {useCallback, useMemo} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {sendErrorNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from './actions';
import {renderQueueItemSubtitleStyle} from './item-style';

export const RenderQueueOutputName: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	const [hovered, setHovered] = React.useState(false);

	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			if (job.deletedOutputLocation) return;
			e.stopPropagation();

			openInFileExplorer({directory: job.outName}).catch((err) => {
				sendErrorNotification(err.message);
			});
		},
		[job],
	);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style = useMemo((): React.CSSProperties => {
		return {
			...renderQueueItemSubtitleStyle,
			cursor: job.deletedOutputLocation ? 'inherit' : 'pointer',
			textDecoration: job.deletedOutputLocation ? 'line-through' : 'none',
			color:
				hovered && !job.deletedOutputLocation
					? 'white'
					: renderQueueItemSubtitleStyle.color,
		};
	}, [hovered, job.deletedOutputLocation]);

	return (
		<button
			onPointerLeave={onPointerLeave}
			onPointerEnter={onPointerEnter}
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
