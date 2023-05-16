import {ArtifactRegistryClient} from '@google-cloud/artifact-registry';

export const validateImageRemotionVersion = async (remotionVersion: string) => {
	const client = new ArtifactRegistryClient();
	const listedTags = await client.listTags({
		parent:
			'projects/remotion-dev/locations/us/repositories/cloud-run/packages/render',
	});

	for (const tag of listedTags[0]) {
		if (remotionVersion === tag.name?.split('/').pop()) {
			// if match is found, exit the function
			return;
		}
	}

	throw new Error(
		`The tag for Remotion version ${remotionVersion} was not found in the cloud run registry image.`
	);
};
