import React, {useCallback, useMemo} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {notificationCenter} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from './actions';
import {renderQueueItemSubtitleStyle} from './item-style';

const formatOutputLocation = (location: string) => {
	if (location.startsWith(window.remotion_cwd)) {
		const out = location.substring(window.remotion_cwd.length);

		if (out.startsWith('/') || out.startsWith('\\')) {
			return out.substring(1);
		}

		return out;
	}

	return location;
};

export const RenderQueueOutputName: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	const onClick = useCallback(() => {
		openInFileExplorer({directory: job.outputLocation}).catch((err) => {
			notificationCenter.current?.addNotification({
				content: `Could not open file: ${err.message}`,
				created: Date.now(),
				duration: 2000,
				id: String(Math.random()),
			});
		});
	}, [job.outputLocation]);

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
			title={
				job.deletedOutputLocation ? 'File was deleted' : job.outputLocation
			}
		>
			{formatOutputLocation(job.outputLocation)}
		</button>
	);
};
