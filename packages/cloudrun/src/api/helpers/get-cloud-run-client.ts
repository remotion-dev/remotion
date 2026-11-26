// eslint-disable-next-line no-restricted-imports -- The pinned SDK's root entry bundles unused v1 clients.
import {ServicesClient} from '@google-cloud/run/build/src/v2';
import {
	getProjectId,
	isInCloudTask,
} from '../../functions/helpers/is-in-cloud-task';
import {checkCredentials} from '../../shared/check-credentials';

export const getCloudRunClient = () => {
	checkCredentials();

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
