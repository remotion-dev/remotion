import {Storage} from '@google-cloud/storage';
import {
	getProjectId,
	isInCloudTask,
} from '../../functions/helpers/is-in-cloud-task';
import {checkCredentials} from '../../shared/check-credentials';

export const getCloudStorageClient = () => {
	checkCredentials();

	return new Storage({
		projectId: getProjectId(),
		credentials: isInCloudTask()
			? undefined
			: {
					client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
					private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
				},
		interceptors_: [
			{
				resolved: (config) => {
					// Storage 9.0.0 sends these internal options as object deletion query parameters.
					if (config.method === 'DELETE') {
						config.url.searchParams.delete('responseType');
						config.url.searchParams.delete('validateStatus');
					}

					return Promise.resolve(config);
				},
			},
		],
	});
};
