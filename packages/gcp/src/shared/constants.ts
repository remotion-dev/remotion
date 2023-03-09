import type {GcpRegion} from '../pricing/gcp-regions';

export const DEFAULT_REGION: GcpRegion = 'us-east1';
export const BINARY_NAME = 'remotion gcp';

export const REMOTION_BUCKET_PREFIX = 'remotioncloudrun-';

export const getSitesKey = (siteId: string) => `sites/${siteId}`;

export const DEFAULT_MAX_RETRIES = 1;

export const inputPropsKey = (hash: string) => {
	return `input-props/${hash}.json`;
};
