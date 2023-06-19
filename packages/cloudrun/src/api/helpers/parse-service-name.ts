import {GcpRegion} from '../../pricing/gcp-regions';
import {RENDER_SERVICE_PREFIX} from '../../shared/constants';

export const getGcpParent = (region: GcpRegion) => {
	const parent = `projects/${process.env.REMOTION_GCP_PROJECT_ID}/locations/${region}`;
	return parent;
};

export const parseServiceName = (serviceName: string, region: GcpRegion) => {
	const parent = getGcpParent(region);
	const deployedServiceName = serviceName.replace(
		parent + '/services/',
		''
	) as string;
	const deployedRegion = serviceName.split('/')[3] as string;

	return {
		serviceName: deployedServiceName,
		remotionVersion: serviceName
			.replace(parent + '/services/' + RENDER_SERVICE_PREFIX + '--', '')
			.split('--')[0]
			.replace(/-/g, '.') as string,
		region: deployedRegion as GcpRegion,
		consoleUrl: `https://console.cloud.google.com/run/detail/${deployedRegion}/${deployedServiceName}/logs`,
	};
};
