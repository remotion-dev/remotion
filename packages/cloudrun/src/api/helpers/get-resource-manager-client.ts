import {v3} from '@google-cloud/resource-manager';
const {ProjectsClient} = v3;

export const getResourceManagerClient = () => {
	return new ProjectsClient({
		projectId: process.env.REMOTION_GCP_PROJECT_ID,
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
