import {GoogleAuth} from 'google-auth-library';

export const getAuthClientForUrl = async (url: string) => {
	let auth = null;
	if (
		process.env.REMOTION_GCP_CLIENT_EMAIL &&
		process.env.REMOTION_GCP_PRIVATE_KEY
	) {
		auth = new GoogleAuth({
			credentials: {
				client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
				private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
			},
		});
	} else {
		auth = new GoogleAuth();
	}

	const client = await auth.getIdTokenClient(url);
	return client;
};
