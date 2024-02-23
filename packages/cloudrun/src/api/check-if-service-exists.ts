import type {protos} from '@google-cloud/run';
import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {Log} from '../cli/log';
import {generateServiceName} from '../shared/generate-service-name';
import {validateGcpRegion} from '../shared/validate-gcp-region';
import {validateProjectID} from '../shared/validate-project-id';
import {getCloudRunClient} from './helpers/get-cloud-run-client';

export type CheckIfServiceExistsInput = {
	projectID: string;
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
	region: string;
	logLevel: LogLevel;
};

/**
 * @description Lists Cloud Run services in the project, and checks for a matching name.
 * @param projectID GCP Project ID of Cloud Run service to check for.
 * @param memoryLimit Memory limit of Cloud Run service to check for.
 * @param cpuLimit CPU limit of Cloud Run service to check for.
 * @param timeoutSeconds Timeout of Cloud Run service to check for.
 * @param region The region of Cloud Run service to check for.
 * @returns {Promise<protos.google.cloud.run.v2.IService>} Returns Service object.
 */
export const checkIfServiceExists = async ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	projectID,
	region,
	logLevel,
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
	} catch (e: any) {
		if (e.code === 7) {
			Log.error(
				{indent: false, logLevel},
				CliInternals.chalk.red(
					`Issue with ${parent}. The project either doesn't exist, or you don't have access to it.
					`,
				),
			);
		}

		throw e;
	}
};
