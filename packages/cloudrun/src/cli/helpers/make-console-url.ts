import type {GcpRegion} from '../../pricing/gcp-regions';

export const makeConsoleUrl = (region: GcpRegion, shortName: string) => {
	return `https://console.cloud.google.com/run/detail/${region}/${shortName}/logs?project=${process.env.REMOTION_GCP_PROJECT_ID}`;
};
