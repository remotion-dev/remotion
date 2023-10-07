import type {GcpRegion} from '../pricing/gcp-regions';
import {GCP_REGIONS} from '../pricing/gcp-regions';

export const validateRegion = (region: unknown) => {
	if (typeof region !== 'string') {
		throw new TypeError(
			`"region" parameter must be a string, but is ${JSON.stringify(region)}`,
		);
	}

	// check region is part of GCP_REGIONS list
	if (!GCP_REGIONS.includes(region as GcpRegion)) {
		throw new TypeError(
			`"region" parameter must be one of ${GCP_REGIONS.join(
				', ',
			)}, but is ${JSON.stringify(region)}`,
		);
	}

	return region as GcpRegion;
};
