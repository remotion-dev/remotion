import type {GcpRegion} from '../pricing/gcp-regions';
import {DEFAULT_REGION} from '../shared/constants';
import {validateGcpRegion} from '../shared/validate-gcp-region';
import {parsedCloudrunCli} from './args';

export const getGcpRegion = (): GcpRegion => {
	if (parsedCloudrunCli.region) {
		validateGcpRegion(parsedCloudrunCli.region);
		return parsedCloudrunCli.region;
	}

	return DEFAULT_REGION;
};
