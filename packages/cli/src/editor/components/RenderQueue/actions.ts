import type {StillImageFormat} from '@remotion/renderer';
import type {TCompMetadata} from 'remotion';
import type {
	AddRenderRequest,
	OpenInFileExplorerRequest,
	RemoveRenderRequest,
	RenderJob,
} from '../../../preview-server/render-queue/job';
import {notificationCenter} from '../Notifications/NotificationCenter';

export const removeRenderJob = (job: RenderJob) => {
	const body: RemoveRenderRequest = {
		jobId: job.id,
	};

	return new Promise<void>((resolve, reject) => {
		fetch(`/api/remove-render`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => res.json())
			.then((data: {success: boolean}) => {
				if (data.success) {
					resolve();
				} else {
					// TODO: Why?
					reject(new Error('Failed to remove render job'));
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
};

export const addStillRenderJob = ({
	composition,
	outName,
	imageFormat,
	quality,
	frame,
	scale,
}: {
	composition: TCompMetadata;
	outName: string;
	imageFormat: StillImageFormat;
	quality: number | null;
	frame: number;
	scale: number;
}) => {
	const body: AddRenderRequest = {
		compositionId: composition.id,
		type: 'still',
		outName,
		imageFormat,
		quality,
		frame,
		scale,
	};

	return new Promise<void>((resolve, reject) => {
		fetch(`/api/render`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => res.json())
			.then((data: {success: boolean}) => {
				if (data.success) {
					resolve();
				} else {
					// TODO: Why?
					reject(new Error('Failed to add render job'));
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
};

export const openInFileExplorer = ({directory}: {directory: string}) => {
	const body: OpenInFileExplorerRequest = {
		directory,
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
};
