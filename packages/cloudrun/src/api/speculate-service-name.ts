import {generateServiceName} from '../shared/generate-service-name';

/**
 * @description Speculate the name of a cloud run service that will be created when you call `deployService`, based on the service configuration.
 * @see [Documentation](https://www.remotion.dev/docs/cloudrun/speculateservicename)
 * @param memoryLimit The upper bound on the amount of RAM that the Cloud Run service can consume.
 * @param cpuLimit The maximum number of CPU cores that the Cloud Run service can use to process requests.
 * @param timeoutInSeconds How long the Cloud Run Service may run before it gets killed.
 * @param remotionVersion The Remotion version of the service.
 * @returns {string} The speculated cloud run service name
 */
export const speculateFunctionName = ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	remotionVersion,
}: {
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
	remotionVersion: string;
}): string => {
	return generateServiceName({
		memoryLimit,
		cpuLimit,
		timeoutSeconds,
		remotionVersion,
	});
};
