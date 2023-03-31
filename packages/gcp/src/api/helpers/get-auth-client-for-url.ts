import {GoogleAuth} from 'google-auth-library';

export const getAuthClientForUrl = async (url: string) => {
	const auth = new GoogleAuth({
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
	const client = await auth.getIdTokenClient(url);
	return client;
};
