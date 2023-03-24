import {Storage} from '@google-cloud/storage';

export const getCloudStorageClient = () => {
	return new Storage({
		projectId: 'new-remotion-project', // TODO: Get this from the user
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
