import { v2, protos } from '@google-cloud/run';
import fs from 'fs';
import { validateGcpRegion } from '../shared/validate-gcp-region';
import { validateServiceName } from '../shared/validate-service-name';
import { validateProjectID } from '../shared/validate-project-id';

export type CheckIfServiceExistsInput = {
	serviceNameToCheck: string;
	projectID: string;
	region: string;
};

/**
 * @description Lists Cloud Run services in the project, and checks for a matching name.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param options.projectID GCP Project ID to deploy the Cloud Run service to.
 * @param options.serviceNameToCheck The name of the Cloud Run service.
 * @param options.region The region you want to deploy your Cloud Run service to.
 * @returns {Promise<protos.google.cloud.run.v2.IService>} If the service exists, the service object will be returned, otherwise false.
 */
export const checkIfServiceExists = async (
	options: CheckIfServiceExistsInput
): Promise<protos.google.cloud.run.v2.IService | undefined> => {
	validateGcpRegion(options.region);
	validateServiceName(options.serviceNameToCheck);
	validateProjectID(options.projectID);

	const parent = `projects/${options.projectID}/locations/${options.region}`

	const { ServicesClient } = v2;

	const sa_data = fs.readFileSync('./sa-key.json', 'utf8');
	const sa_json = JSON.parse(sa_data)

	const runClient = new ServicesClient({
		credentials: sa_json
	});
	// Construct request
	const request = {
		parent,
	};

	// Run request
	try {
		const iterable = runClient.listServicesAsync(request);
		for await (const response of iterable) {
			if (response.name === `${parent}/services/${options.serviceNameToCheck}`) {
				return response
			}
		}
		return
	} catch (e: any) {
		throw e;
	}
}
