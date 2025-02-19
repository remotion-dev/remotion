import {makeConsoleUrl} from '../../cli/helpers/make-console-url';
import {getProjectId} from '../../functions/helpers/is-in-cloud-task';
import type {GcpRegion} from '../../pricing/gcp-regions';

export const getGcpParent = (region: GcpRegion) => {
	const parent = `projects/${getProjectId()}/locations/${region}`;
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
		consoleUrl: makeConsoleUrl(deployedRegion as GcpRegion, shortServiceName),
	};
};
