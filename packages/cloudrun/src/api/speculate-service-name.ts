import {generateServiceName} from '../shared/generate-service-name';

/**
 * @description Speculate the name of a Cloud Run service that will be created when you call `deployService`, based on the service configuration.
 * @see [Documentation](https://www.remotion.dev/docs/cloudrun/speculateservicename)
 * @param memoryLimit The upper bound on the amount of RAM that the Cloud Run service can consume.
 * @param cpuLimit The maximum number of CPU cores that the Cloud Run service can use to process requests.
 * @param timeoutInSeconds How long the Cloud Run Service may run before it gets killed.
 * @returns {string} The speculated Cloud Run service name
 */
export const speculateServiceName = ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
}: {
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
}): string => {
	return generateServiceName({
		memoryLimit,
		cpuLimit,
		timeoutSeconds,
	});
};
