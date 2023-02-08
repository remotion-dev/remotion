import type {GcpRegion} from '../pricing/gcp-regions';
import {DEFAULT_REGION} from '../shared/constants';
import {validateGcpRegion} from '../shared/validate-gcp-region';
import {parsedGcpCli} from './args';

export const getGcpRegion = (): GcpRegion => {
	if (parsedGcpCli.region) {
		validateGcpRegion(parsedGcpCli.region);
		return parsedGcpCli.region;
	}

	return DEFAULT_REGION;
};
