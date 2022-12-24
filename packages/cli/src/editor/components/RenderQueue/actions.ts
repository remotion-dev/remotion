import type {StillImageFormat} from '@remotion/renderer';
import type {TCompMetadata} from 'remotion';
import type {ApiRoutes} from '../../../preview-server/api-types';
import type {
	OpenInFileExplorerRequest,
	RenderJob,
} from '../../../preview-server/render-queue/job';

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

export const unsubscribeFromFileExistenceWatcher = ({file}: {file: string}) => {
	return callApi('/api/unsubscribe-from-file-existence', {file});
};

export const subscribeToFileExistenceWatcher = async ({
	file,
}: {
	file: string;
}): Promise<boolean> => {
	const {exists} = await callApi('/api/subscribe-to-file-existence', {file});
	return exists;
};

export const openInFileExplorer = ({directory}: {directory: string}) => {
	const body: OpenInFileExplorerRequest = {
		directory,
	};
	return callApi('/api/open-in-file-explorer', body);
};

export const removeRenderJob = (job: RenderJob) => {
	return callApi('/api/remove-render', {
		jobId: job.id,
	});
};
