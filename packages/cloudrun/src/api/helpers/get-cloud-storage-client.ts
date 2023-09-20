import {Storage} from '@google-cloud/storage';

export const getCloudStorageClient = () => {
	if (
		process.env.REMOTION_GCP_PROJECT_ID &&
		process.env.REMOTION_GCP_CLIENT_EMAIL &&
		process.env.REMOTION_GCP_PRIVATE_KEY
	) {
		return new Storage({
			projectId: process.env.REMOTION_GCP_PROJECT_ID,
			credentials: {
				client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
				private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
			},
		});
	}

	return new Storage();
};
