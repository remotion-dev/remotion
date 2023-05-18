import type {GcpRegion} from '../pricing/gcp-regions';
import {RENDER_SERVICE_PREFIX} from '../shared/constants';
import {getCloudRunClient} from './helpers/get-cloud-run-client';

export type ServiceInfo = {
	serviceName: string;
	timeoutInSeconds: number;
	memoryLimit: string;
	cpuLimit: string;
	remotionVersion: string | null;
	uri: string;
	region: string;
	consoleUrl: string;
};

export type GetServiceInfoInput = {
	region: GcpRegion;
	serviceName: string;
};
/**
 * @description Lists Remotion Cloud Run render services deployed to GCP Cloud Run.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getservices)
 * @param options.region The region of which the services should be listed.
 * @param options.compatibleOnly Whether only services compatible with the installed version of Remotion Cloud Run should be returned.
 * @returns {Promise<ServiceInfo[]>} An array with the objects containing information about the deployed services.
 */

export const getServiceInfo = async ({
	region,
	serviceName,
}: GetServiceInfoInput): Promise<ServiceInfo> => {
	const cloudRunClient = getCloudRunClient();

	const [service] = await cloudRunClient.getService({
		name: `projects/${process.env.REMOTION_GCP_PROJECT_ID}/locations/${region}/services/${serviceName}`,
	});

	if (!service) {
		throw new Error(`Service ${serviceName} not found`);
	}

	const parent = `projects/${process.env.REMOTION_GCP_PROJECT_ID}/locations/${region}`;
	const deployedRegion = service.name?.split('/')[3] as string;
	const deployedServiceName = service.name?.replace(
		parent + '/services/',
		''
	) as string;

	return {
		serviceName: deployedServiceName,
		timeoutInSeconds: service.template?.timeout?.seconds as number,
		memoryLimit: service.template?.containers?.[0].resources?.limits
			?.memory as string,
		cpuLimit: service.template?.containers?.[0].resources?.limits
			?.cpu as string,
		remotionVersion: service.name
			?.replace(parent + '/services/' + RENDER_SERVICE_PREFIX + '--', '')
			.split('--')[0]
			.replace(/-/g, '.') as string,
		uri: service.uri as string,
		region: deployedRegion,
		consoleUrl: `https://console.cloud.google.com/run/detail/${deployedRegion}/${deployedServiceName}/logs`,
	};
};
