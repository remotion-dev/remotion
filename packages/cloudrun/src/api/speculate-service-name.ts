import {generateServiceName} from '../shared/generate-service-name';

/*
 * @description Speculate the name of the Cloud Run service that will be created by `deployService` or its CLI equivalent, based on the provided configuration parameters.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/speculateservicename)
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
