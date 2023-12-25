import {getProjectId} from '../../functions/helpers/is-in-cloud-task';
import type {GcpRegion} from '../../pricing/gcp-regions';

export const makeConsoleUrl = (region: GcpRegion, shortName: string) => {
	return `https://console.cloud.google.com/run/detail/${region}/${shortName}/logs?project=${getProjectId()}`;
};
