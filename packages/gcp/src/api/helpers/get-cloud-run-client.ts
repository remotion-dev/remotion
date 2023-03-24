import {v2} from '@google-cloud/run';

const {ServicesClient} = v2;

export const getCloudRunClient = () => {
	return new ServicesClient({
		projectId: process.env.REMOTION_GCP_PROJECT_ID,
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
