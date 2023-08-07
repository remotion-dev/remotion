import {v2} from '@google-cloud/logging';

const {LoggingServiceV2Client} = v2;

export const getCloudLoggingClient = () => {
	return new LoggingServiceV2Client({
		projectId: process.env.REMOTION_GCP_PROJECT_ID,
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
};
