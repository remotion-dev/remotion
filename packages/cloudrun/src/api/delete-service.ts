import {getProjectId} from '../functions/helpers/is-in-cloud-task';
import {getCloudRunClient} from './helpers/get-cloud-run-client';

export type DeleteServiceInput = {
	serviceName: string;
	region: string;
};

/**
 * @description Deletes a service from GCP Cloud Run
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deleteservice)
 * @param params.serviceName The name of the service to delete.
 * @param params.region The region of the service to delete.
 * @returns {Promise<void>} Nothing. Throws if the service failed to delete.
 */
export const deleteService = async (
	params: DeleteServiceInput,
): Promise<void> => {
	const cloudRunClient = getCloudRunClient();

	// Run request
	await cloudRunClient.deleteService({
		name: `projects/${getProjectId()}/locations/${params.region}/services/${
			params.serviceName
		}`,
	});
};
