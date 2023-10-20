import {makeConsoleUrl} from '../cli/helpers/make-console-url';
import {getProjectId} from '../functions/helpers/is-in-cloud-task';
import type {GcpRegion} from '../pricing/gcp-regions';
import {getCloudRunClient} from './helpers/get-cloud-run-client';
import {parseServiceName} from './helpers/parse-service-name';

export type ServiceInfo = {
	serviceName: string;
	timeoutInSeconds: number;
	memoryLimit: string;
	cpuLimit: string;
	remotionVersion: string | null;
	uri: string;
	region: GcpRegion;
	consoleUrl: string;
};

export type GetServiceInfoInput = {
	region: GcpRegion;
	serviceName: string;
};
/**
 * @description Given a region and service name, returns information about the service such as version, memory limit and timeout.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getserviceinfo)
 * @param params.region The region in which the service resides in.
 * @param params.serviceName The name of the service.
 * @returns {Promise<ServiceInfo[]>} An array with the objects containing information about the deployed services.
 */

export const getServiceInfo = async ({
	region,
	serviceName,
}: GetServiceInfoInput): Promise<ServiceInfo> => {
	const cloudRunClient = getCloudRunClient();

	const [service] = await cloudRunClient.getService({
		name: `projects/${getProjectId()}/locations/${region}/services/${serviceName}`,
	});

	if (!service) {
		throw new Error(`Service ${serviceName} not found`);
	}

	const {
		region: deployedRegion,
		remotionVersion,
		serviceName: deployedServiceName,
	} = parseServiceName(service.name as string, region);

	return {
		serviceName: deployedServiceName,
		timeoutInSeconds: service.template?.timeout?.seconds as number,
		memoryLimit: service.template?.containers?.[0].resources?.limits
			?.memory as string,
		cpuLimit: service.template?.containers?.[0].resources?.limits
			?.cpu as string,
		remotionVersion,
		uri: service.uri as string,
		region: deployedRegion,
		consoleUrl: makeConsoleUrl(deployedRegion, deployedServiceName),
	};
};
