import {v2} from '@google-cloud/run';
import {
	getProjectId,
	isInCloudTask,
} from '../../functions/helpers/is-in-cloud-task';

const {ServicesClient} = v2;

export const getCloudRunClient = () => {
	if (isInCloudTask()) {
		return new ServicesClient({
			projectId: getProjectId(),
		});
	}

	return new ServicesClient({
		projectId: process.env.REMOTION_GCP_PROJECT_ID,
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
