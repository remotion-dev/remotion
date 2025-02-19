import {getProjectId} from '../functions/helpers/is-in-cloud-task';
import {getCloudRunClient} from './helpers/get-cloud-run-client';

export type DeleteServiceInput = {
	serviceName: string;
	region: string;
};

/*
 * @description Deletes a deployed Cloud Run service based on its name.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deleteservice)
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
