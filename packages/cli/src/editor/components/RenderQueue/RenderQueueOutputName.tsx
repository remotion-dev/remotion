import React, {useCallback} from 'react';
import type {
	OpenInFileExplorerRequest,
	RenderJob,
} from '../../../preview-server/render-queue/job';
import {LIGHT_TEXT} from '../../helpers/colors';
import {notificationCenter} from '../Notifications/NotificationCenter';

const outputLocation: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	appearance: 'none',
	border: 'none',
	padding: 0,
	cursor: 'pointer',
};

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
		const body: OpenInFileExplorerRequest = {
			directory: job.outputLocation,
		};
		fetch(`/api/open-in-file-explorer`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => res.json())
			.then((data: {success: true} | {success: false; error: string}) => {
				if (data.success) {
					console.log('Opened file in explorer');
				} else {
					notificationCenter.current?.addNotification({
						content: `Could not open file: ${data.error}`,
						created: Date.now(),
						duration: 2000,
						id: String(Math.random()),
					});
				}
			})
			.catch((err) => {
				notificationCenter.current?.addNotification({
					content: `Could not open file: ${err.message}`,
					created: Date.now(),
					duration: 2000,
					id: String(Math.random()),
				});
			});
	}, [job.outputLocation]);

	return (
		<button onClick={onClick} type="button" style={outputLocation}>
			{formatOutputLocation(job.outputLocation)}
		</button>
	);
};
