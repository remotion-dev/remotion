import type {GcpRegion} from '../../client';
import {GCP_REGION_SHORTHAND} from '../../pricing/gcp-regions';

type CloudRunInfo = {
	region: GcpRegion;
	projectHash: string;
	serviceName: string;
};

export const parseCloudRunUrl = (url: string): CloudRunInfo => {
	const match = url.match(/https:\/\/(.*)-(.*)-(.*).run.app/);
	if (!match) {
		throw new Error(`Could not parse Cloud Run URL: ${url}`);
	}

	const shorthand = Object.keys(GCP_REGION_SHORTHAND).find(
		(key) => GCP_REGION_SHORTHAND[key as GcpRegion] === match[3]
	);

	if (!shorthand) {
		throw new Error('Could not find region shorthand for URL: ' + url);
	}

	return {
		serviceName: match[1],
		projectHash: match[2],
		region: shorthand as GcpRegion,
	};
};
