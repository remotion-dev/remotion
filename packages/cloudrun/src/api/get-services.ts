import {JWT} from 'google-auth-library';
import {VERSION} from 'remotion/version';
import type {GcpRegion} from '../pricing/gcp-regions';
import {RENDER_SERVICE_PREFIX} from '../shared/constants';
import {serviceVersionString} from '../shared/service-version-string';
import type {ServiceInfo} from './get-service-info';
import {getCloudRunClient} from './helpers/get-cloud-run-client';
import type {IService} from './helpers/IService';

export type GetServicesInput = {
	region: GcpRegion | 'all regions';
	compatibleOnly: boolean;
};

type v1Data = {
	items: {
		metadata: {
			name: string;
			uid: string;
			labels: {
				'cloud.googleapis.com/location': string;
			};
			creationTimestamp: string;
		};
		status: {
			url: string;
		};
		spec: {
			template: {
				spec: {
					timeoutSeconds: number;
					containers: {
						resources: {
							limits: {cpu: string; memory: string};
						};
					}[];
				};
			};
		};
	}[];
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
	if (options.region === 'all regions') {
		const cloudRunEndpoint = `https://run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${process.env.REMOTION_GCP_PROJECT_ID}/services`;

		const client = new JWT({
			email: process.env.REMOTION_GCP_CLIENT_EMAIL,
			key: process.env.REMOTION_GCP_PRIVATE_KEY,
			scopes: ['https://www.googleapis.com/auth/cloud-platform'],
		});

		const res = await client.request({url: cloudRunEndpoint});

		const data = res.data as v1Data;

		return data.items.map((service): ServiceInfo => {
			const deployedRegion = service.metadata.labels[
				'cloud.googleapis.com/location'
			] as string;

			return {
				serviceName: service.metadata.name as string,
				timeoutInSeconds: service.spec.template.spec.timeoutSeconds as number,
				memoryLimit: service.spec.template.spec.containers?.[0].resources
					?.limits?.memory as string,
				cpuLimit: service.spec.template.spec.containers?.[0].resources?.limits
					?.cpu as string,
				remotionVersion: service.metadata.name
					.split('--')[1]
					.replace(/-/g, '.') as string,
				uri: service.status.url as string,
				region: deployedRegion as GcpRegion,
				consoleUrl: `https://console.cloud.google.com/run/detail/${deployedRegion}/${service.metadata.name}/logs`,
			};
		});
	}

	const cloudRunClient = getCloudRunClient();

	const parent = `projects/${process.env.REMOTION_GCP_PROJECT_ID}/locations/${options.region}`;

	const [services] = await cloudRunClient.listServices({
		parent,
	});

	let remotionServices: IService[] = [];

	if (options.compatibleOnly) {
		remotionServices = services.filter((s) => {
			return s.name?.startsWith(
				`${parent}/services/${RENDER_SERVICE_PREFIX}--${serviceVersionString(
					VERSION
				)}--`
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
		const deployedServiceName = service.name?.replace(
			parent + '/services/',
			''
		) as string;
		const deployedRegion = service.name?.split('/')[3] as string;

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
			region: deployedRegion as GcpRegion,
			consoleUrl: `https://console.cloud.google.com/run/detail/${deployedRegion}/${deployedServiceName}/logs`,
		};
	});
};
