import {getCloudRunClient} from './helpers/get-cloud-run-client';

export type DeleteServiceInput = {
	serviceName: string;
	region: string;
};

/**
 * @description Deletes a service from GCP Cloud Run
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deleteservice)
 * @param options.serviceName The name of the service.
 * @returns {Promise<void>} Nothing. Throws if the service failed to delete.
 */
export const deleteService = async (
	options: DeleteServiceInput
): Promise<void> => {
	const cloudRunClient = getCloudRunClient();

	// Run request
	await cloudRunClient.deleteService({
		name: `projects/${process.env.REMOTION_GCP_PROJECT_ID}/locations/${options.region}/services/${options.serviceName}`,
	});
};
