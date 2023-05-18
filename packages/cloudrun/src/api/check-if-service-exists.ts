import type {protos} from '@google-cloud/run';
import {CliInternals} from '@remotion/cli';
import {Log} from '../cli/log';
import {generateServiceName} from '../shared/generate-service-name';
import {validateGcpRegion} from '../shared/validate-gcp-region';
import {validateProjectID} from '../shared/validate-project-id';
import {getCloudRunClient} from './helpers/get-cloud-run-client';

export type CheckIfServiceExistsInput = {
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
	projectID: string;
	region: string;
};

/**
 * @description Lists Cloud Run services in the project, and checks for a matching name.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param projectID GCP Project ID to deploy the Cloud Run service to.
 * @param serviceNameToCheck The name of the Cloud Run service.
 * @param region The region you want to deploy your Cloud Run service to.
 * @returns {Promise<protos.google.cloud.run.v2.IService>} If the service exists, the service object will be returned, otherwise false.
 */
export const checkIfServiceExists = async ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	projectID,
	region,
}: CheckIfServiceExistsInput): Promise<
	protos.google.cloud.run.v2.IService | undefined
> => {
	validateGcpRegion(region);
	validateProjectID(projectID);

	const parent = `projects/${projectID}/locations/${region}`;

	const serviceName = generateServiceName({
		memoryLimit,
		cpuLimit,
		timeoutSeconds,
	});

	const cloudRunClient = getCloudRunClient();

	// Run request
	try {
		const iterable = cloudRunClient.listServicesAsync({parent});
		for await (const response of iterable) {
			if (response.name === `${parent}/services/${serviceName}`) {
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
