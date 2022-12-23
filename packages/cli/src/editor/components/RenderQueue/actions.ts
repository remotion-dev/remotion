import type {StillImageFormat} from '@remotion/renderer';
import type {TCompMetadata} from 'remotion';
import type {
	AddRenderRequest,
	RemoveRenderRequest,
	RenderJob,
} from '../../../preview-server/render-queue/job';

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

export const addRenderJob = ({
	composition,
	outName,
	imageFormat,
}: {
	composition: TCompMetadata;
	outName: string;
	imageFormat: StillImageFormat;
}) => {
	const body: AddRenderRequest = {
		compositionId: composition.id,
		type: 'still',
		outName,
		imageFormat,
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
