import {GoogleAuth} from 'google-auth-library';
import {
	getProjectId,
	isInCloudTask,
} from '../../functions/helpers/is-in-cloud-task';
import {checkCredentials} from '../../shared/check-credentials';

export const getAuthClientForUrl = async (url: string) => {
	checkCredentials();

	let auth = new GoogleAuth();
	if (isInCloudTask()) {
		auth = new GoogleAuth({
			projectId: getProjectId(),
		});
	} else {
		auth = new GoogleAuth({
			projectId: process.env.REMOTION_GCP_PROJECT_ID,
			credentials: {
				client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
				private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
			},
		});
	}

	const client = await auth.getIdTokenClient(url);
	return client;
};
