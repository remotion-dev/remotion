import type {GcpRegion} from '../../pricing/gcp-regions';

export const getGcpParent = (region: GcpRegion) => {
	const parent = `projects/${process.env.REMOTION_GCP_PROJECT_ID}/locations/${region}`;
	return parent;
};

export const parseServiceName = (
	fullServiceName: string,
	region: GcpRegion,
) => {
	const parent = getGcpParent(region);
	const shortServiceName = fullServiceName.replace(parent + '/services/', '');
	const deployedRegion = fullServiceName.split('/')[3] as string;

	const matched = shortServiceName.match(/remotion-(.*)-mem([0-9])/);

	if (!matched) {
		throw new Error(`Could not parse service name ${shortServiceName}`);
	}

	return {
		serviceName: shortServiceName,
		remotionVersion: matched[1],
		region: deployedRegion as GcpRegion,
		consoleUrl: `https://console.cloud.google.com/run/detail/${deployedRegion}/${shortServiceName}/logs`,
	};
};
