import {Storage} from '@google-cloud/storage';

export const getCloudStorageClient = () => {
	return new Storage({
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
