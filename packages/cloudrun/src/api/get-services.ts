import type {GcpRegion} from '../pricing/gcp-regions';
import {RENDER_SERVICE_PREFIX} from '../shared/constants';
import {SERVICE_VERSION_STRING} from '../shared/service-version-string';
import type {ServiceInfo} from './get-service-info';
import {getCloudRunClient} from './helpers/get-cloud-run-client';
import type {IService} from './helpers/IService';

export type GetServicesInput = {
	region: GcpRegion;
	compatibleOnly: boolean;
};

/**
 * @description Lists Remotion Cloud Run render services deployed to GCP Cloud Run.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getservices)
 * @param options.region The region of which the services should be listed.
 * @param options.compatibleOnly Whether only services compatible with the installed version of Remotion Cloud Run should be returned.
 * @returns {Promise<ServiceInfo[]>} An array with the objects containing information about the deployed services.
 */

export const getServices = async (
	options: GetServicesInput
): Promise<ServiceInfo[]> => {
	const cloudRunClient = getCloudRunClient();

	const parent = `projects/${process.env.REMOTION_GCP_PROJECT_ID}/locations/${options.region}`;

	const [services] = await cloudRunClient.listServices({
		parent,
	});

	let remotionServices: IService[] = [];

	if (options.compatibleOnly) {
		remotionServices = services.filter((s) => {
			return s.name?.startsWith(
				`${parent}/services/${RENDER_SERVICE_PREFIX}--${SERVICE_VERSION_STRING}--`
			);
		});
	} else {
		remotionServices = services.filter((s) => {
			return s.name?.startsWith(
				`${parent}/services/${RENDER_SERVICE_PREFIX}--`
			);
		});
	}

	return remotionServices.map((service): ServiceInfo => {
		return {
			serviceName: service.name?.replace(parent + '/services/', '') as string,
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
		};
	});
};
