import {v3} from '@google-cloud/resource-manager';
import {
	getProjectId,
	isInCloudTask,
} from '../../functions/helpers/is-in-cloud-task';
const {ProjectsClient} = v3;

export const getResourceManagerClient = () => {
	if (isInCloudTask()) {
		return new ProjectsClient({
			projectId: getProjectId(),
		});
	}

	return new ProjectsClient({
		projectId: process.env.REMOTION_GCP_PROJECT_ID,
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
