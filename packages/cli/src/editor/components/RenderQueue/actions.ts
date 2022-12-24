import type {StillImageFormat} from '@remotion/renderer';
import type {TCompMetadata} from 'remotion';
import type {ApiRoutes} from '../../../preview-server/api-types';
import type {
	OpenInFileExplorerRequest,
	RemoveRenderRequest,
	RenderJob,
	SubscribeToFileExistence,
	UnsubscribeFromFileExistence,
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

export const callApi = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request']
): Promise<ApiRoutes[Endpoint]['Response']> => {
	return new Promise<ApiRoutes[Endpoint]['Response']>((resolve, reject) => {
		fetch(endpoint, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => res.json())
			.then(
				(
					data:
						| {success: true; data: ApiRoutes[Endpoint]['Response']}
						| {success: false; error: string}
				) => {
					if (data.success) {
						resolve(data.data);
					} else {
						reject(new Error(data.error));
					}
				}
			)
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
	return callApi('/api/render', {
		compositionId: composition.id,
		type: 'still',
		outName,
		imageFormat,
		quality,
		frame,
		scale,
	});
};

export const unsubscribeFromFileExistenceWatcher = async ({
	file,
}: {
	file: string;
}) => {
	const body: UnsubscribeFromFileExistence = {
		file,
	};
	const res = await fetch(`/api/unsubscribe-from-file-existence`, {
		method: 'post',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	const data = (await res.json()) as
		| {success: true}
		| {success: false; error: string};

	if (!data.success) {
		throw new Error(data.error);
	}
};

export const subscribeToFileExistenceWatcher = async ({
	file,
}: {
	file: string;
}) => {
	const body: SubscribeToFileExistence = {
		file,
	};
	const res = await fetch(`/api/subscribe-to-file-existence`, {
		method: 'post',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	const data = (await res.json()) as
		| {success: true; data: {exists: boolean}}
		| {success: false; error: string};

	if (!data.success) {
		throw new Error(data.error);
	}

	const {exists} = data.data;
	return exists;
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
