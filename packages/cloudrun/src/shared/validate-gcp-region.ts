import type {GcpRegion} from '../pricing/gcp-regions';
import {GCP_REGIONS} from '../pricing/gcp-regions';

export function validateGcpRegion(
	region: unknown,
): asserts region is GcpRegion {
	if (!GCP_REGIONS.includes(region as GcpRegion)) {
		throw new TypeError(
			`${region} is not a valid GCP region. Must be one of: ${GCP_REGIONS.join(
				', ',
			)}`,
		);
	}
}
