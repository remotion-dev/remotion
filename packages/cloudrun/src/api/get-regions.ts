import type {GcpRegion} from '../pricing/gcp-regions';
import {GCP_REGIONS} from '../regions';

/**
 * @description Gets an array of all supported GCP regions of this release of Remotion Cloudrun.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getregions)
 * @returns {GcpRegion[]} A list of GCP regions.
 */
export const getRegions = (): readonly GcpRegion[] => {
	return GCP_REGIONS;
};
