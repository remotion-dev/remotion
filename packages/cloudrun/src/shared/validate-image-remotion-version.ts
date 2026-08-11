import {ArtifactRegistryClient} from '@google-cloud/artifact-registry';
import {VERSION} from 'remotion/version';

export const validateImageRemotionVersion = async () => {
	const client = new ArtifactRegistryClient({
		projectId: process.env.REMOTION_GCP_PROJECT_ID,
		credentials: {
			client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
		},
	});
	const listedTags = await client.listTags({
		parent:
			'projects/remotion-dev/locations/us/repositories/production/packages/render',
	});

	for (const tag of listedTags[0]) {
		if (VERSION === tag.name?.split('/').pop()) {
			// if match is found, exit the function
			return;
		}
	}

	throw new Error(
		`The tag for Remotion version ${VERSION} was not found in the Cloud run registry.`,
	);
};
