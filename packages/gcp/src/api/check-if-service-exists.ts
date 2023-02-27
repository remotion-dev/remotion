import type {protos} from '@google-cloud/run';
import {v2} from '@google-cloud/run';
import {CliInternals} from '@remotion/cli';
import fs from 'fs';
import {Log} from '../cli/log';
import {validateGcpRegion} from '../shared/validate-gcp-region';
import {validateProjectID} from '../shared/validate-project-id';
import {validateServiceName} from '../shared/validate-service-name';

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

	const parent = `projects/${options.projectID}/locations/${options.region}`;

	const {ServicesClient} = v2;

	const sa_data = fs.readFileSync('./sa-key.json', 'utf8');
	const sa_json = JSON.parse(sa_data);

	const runClient = new ServicesClient({
		credentials: sa_json,
	});
	// Construct request
	const request = {
		parent,
	};

	// Run request
	try {
		const iterable = runClient.listServicesAsync(request);
		for await (const response of iterable) {
			if (
				response.name === `${parent}/services/${options.serviceNameToCheck}`
			) {
				return response;
			}
		}

		return;
	} catch (e: any) {
		if (e.code === 7) {
			Log.error(
				CliInternals.chalk.red(
					`Issue with ${parent}. The project either doesn't exist, or you don't have access to it.
					`
				)
			);
			throw e;
		} else {
			throw e;
		}
	}
};
