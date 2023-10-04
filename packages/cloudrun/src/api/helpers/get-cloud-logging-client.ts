import {v2} from '@google-cloud/logging';
import {
	getProjectId,
	isInCloudTask,
} from '../../functions/helpers/is-in-cloud-task';

const {LoggingServiceV2Client} = v2;

export const getCloudLoggingClient = () => {
	if (isInCloudTask()) {
		return new LoggingServiceV2Client({
			projectId: getProjectId(),
		});
	}

	return new LoggingServiceV2Client({
		projectId: process.env.REMOTION_GCP_PROJECT_ID,
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
